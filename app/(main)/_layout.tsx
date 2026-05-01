import { Tabs } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Circle, Path, Rect, Svg } from 'react-native-svg';

const D = {
  bg:     '#060608',
  panel:  '#0d0d18',
  card:   '#13131f',
  border: '#1e1e2e',
  accent: '#ffffff',
  muted:  '#6b7280',
  purple: '#7c3aed',
};

function HomeIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z" stroke={color} strokeWidth={1.8} strokeLinejoin="round"/>
      <Path d="M9 21V12h6v9" stroke={color} strokeWidth={1.8} strokeLinecap="round"/>
    </Svg>
  );
}

function PlaygroundIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={8} r={4} stroke={color} strokeWidth={1.8}/>
      <Path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={color} strokeWidth={1.8} strokeLinecap="round"/>
    </Svg>
  );
}

function StudioIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" stroke={color} strokeWidth={1.8} strokeLinejoin="round"/>
    </Svg>
  );
}

function ExportIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={3} width={7} height={7} rx={1.5} stroke={color} strokeWidth={1.8}/>
      <Rect x={14} y={3} width={7} height={7} rx={1.5} stroke={color} strokeWidth={1.8}/>
      <Rect x={3} y={14} width={7} height={7} rx={1.5} stroke={color} strokeWidth={1.8}/>
      <Path d="M17.5 14v6M14.5 17h6" stroke={color} strokeWidth={1.8} strokeLinecap="round"/>
    </Svg>
  );
}

// Routes to hide from the nav bar
const HIDDEN_ROUTES = new Set(['item-selection']);

function FloatingTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();

  // Only show routes that have a tabBarIcon and aren't hidden
  const visibleRoutes = state.routes.filter((route: any) => {
    if (HIDDEN_ROUTES.has(route.name)) return false;
    const { options } = descriptors[route.key];
    return !!options.tabBarIcon;
  });

  return (
    <View style={[tb.wrapper, { bottom: insets.bottom + 16 }]}>
      <View style={tb.pill}>
        {visibleRoutes.map((route: any) => {
          const { options } = descriptors[route.key];
          const focused = state.index === state.routes.indexOf(route);

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
          };

          const iconColor = focused ? '#a78bfa' : D.muted;

          return (
            <TouchableOpacity
              key={route.key}
              style={tb.tab}
              onPress={onPress}
              activeOpacity={0.7}
            >
              <View style={[tb.iconWrap, focused && tb.iconWrapActive]}>
                {options.tabBarIcon?.({ color: iconColor, focused, size: 22 })}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const tb = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
  pill: {
    flexDirection: 'row',
    backgroundColor: '#0d0d18',
    borderRadius: 50,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#1e1e2e',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 20,
    gap: 4,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  iconWrapActive: {
    backgroundColor: '#7c3aed28',
  },
});

export default function MainLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen
        name="home"
        options={{ title: 'Home', tabBarIcon: ({ color }) => <HomeIcon color={color} /> }}
      />
      <Tabs.Screen
        name="avatar-editor"
        options={{ title: '3D Playground', tabBarIcon: ({ color }) => <PlaygroundIcon color={color} /> }}
      />
      <Tabs.Screen
        name="ai-generate"
        options={{ title: '2D Studio', tabBarIcon: ({ color }) => <StudioIcon color={color} /> }}
      />
      <Tabs.Screen
        name="export-avatar"
        options={{ title: 'Export', tabBarIcon: ({ color }) => <ExportIcon color={color} /> }}
      />
      <Tabs.Screen name="item-selection" options={{ href: null }} />
    </Tabs>
  );
}
