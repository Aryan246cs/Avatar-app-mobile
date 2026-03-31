require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const axios = require('axios');
const Asset = require('../models/Asset');

const MONGODB_URI = process.env.MONGODB_URI;
const RPM_APP_ID = process.env.RPM_APP_ID;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not found in .env");
  process.exit(1);
}

if (!RPM_APP_ID) {
  console.error("❌ RPM_APP_ID not found in .env. You must provide an App ID to sync assets.");
  process.exit(1);
}

// Map RPM categories to our app categories
// We sync all standard RPM accessory categories we support
const ASSET_TYPES = ['jacket', 'pants', 'shirt', 'shoes', 'hair', 'mask', 'outfit'];
const GENDERS = ['male', 'female'];

async function syncAssets() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    let totalSynced = 0;

    for (const type of ASSET_TYPES) {
      for (const gender of GENDERS) {
        console.log(`Fetching ${gender} ${type}s...`);
        try {
          const params = {
            type,
            gender,
            limit: 100,
            // Depending on the RPM API, sometimes pagination is needed.
            // We assume 100 is enough for a curated app library.
          };

          const response = await axios.get('https://api.readyplayer.me/v1/assets', {
            params,
            headers: { 
              'X-APP-ID': RPM_APP_ID,
              // Some endpoints might require authentication, but asset lists for a public app ID usually do not.
            }
          });

          // Standard response format according to RPM docs
          const assets = response.data.data || [];
          console.log(`Found ${assets.length} items for ${gender} ${type}`);

          for (const asset of assets) {
            // RPM returns different preview URLs (iconUrl, imageUrl, etc)
            const previewUrl = asset.iconUrl || asset.imageUrl;
            
            if (!asset.id || !asset.glbUrl || !previewUrl) {
                console.warn(`Skipping invalid asset: ${asset.name}`);
                continue;
            }

            await Asset.findOneAndUpdate(
              { assetId: asset.id },
              {
                assetId: asset.id,
                name: asset.name || `${gender} ${type}`,
                type: type, // Map RPM type to our local type filter
                gender: gender,
                glbUrl: asset.glbUrl,
                previewUrl: previewUrl,
              },
              { upsert: true, new: true }
            );
            totalSynced++;
          }
        } catch (error) {
           console.error(`❌ Failed to fetch ${gender} ${type}: ${error.message}`);
           // If 401/403, log specific authentication error
           if (error.response && error.response.status === 401) {
             console.error('Authentication Error: Ensure your RPM_APP_ID is correct and the endpoint does not require a secret token.');
           }
        }
      }
    }

    console.log(`\n✅ Sync complete! Total assets synced: ${totalSynced}`);
  } catch (error) {
    console.error('❌ Sync failed:', error);
  } finally {
    console.log('Closing database connection...');
    await mongoose.connection.close();
    process.exit(0);
  }
}

syncAssets();
