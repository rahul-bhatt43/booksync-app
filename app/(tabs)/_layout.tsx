import MiniPlayer from '@/components/MiniPlayer';
import { useAudio } from '@/contexts/AudioContext';
import { Tabs } from 'expo-router';
import { Compass, Home, Library, User } from 'lucide-react-native';
import React from 'react';
import { Platform, View } from 'react-native';

function TabIcon({ Icon, color, focused }: { Icon: any; color: string; focused: boolean }) {
  return (
    <View className="items-center">
      <Icon color={color} size={24} strokeWidth={focused ? 2.5 : 1.8} />
      {focused && (
        <View
          style={{
            width: 4,
            height: 4,
            borderRadius: 2,
            backgroundColor: '#f59e0b',
            marginTop: 4,
          }}
        />
      )}
    </View>
  );
}

export default function TabLayout() {
  const { currentTrack } = useAudio();

  return (
    <View className="flex-1">
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#09090b',
            borderTopWidth: 1,
            borderTopColor: '#1f1f23',
            height: Platform.OS === 'ios' ? 90 : 72,
            paddingBottom: Platform.OS === 'ios' ? 28 : 14,
            paddingTop: 10,
            elevation: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
          },
          tabBarActiveTintColor: '#f59e0b',
          tabBarInactiveTintColor: '#52525b',
          tabBarLabelStyle: {
            fontFamily: 'Inter-Medium',
            fontSize: 11,
            letterSpacing: 0.3,
          },
          tabBarShowLabel: true,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <TabIcon Icon={Home} color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Explore',
            tabBarIcon: ({ color, focused }) => (
              <TabIcon Icon={Compass} color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="library"
          options={{
            title: 'Library',
            tabBarIcon: ({ color, focused }) => (
              <TabIcon Icon={Library} color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, focused }) => (
              <TabIcon Icon={User} color={color} focused={focused} />
            ),
          }}
        />
      </Tabs>

      {/* Conditionally render MiniPlayer */}
      {currentTrack && <MiniPlayer />}
    </View>
  );
}
