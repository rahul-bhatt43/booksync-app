import React from 'react';
import { StyleProp, View, ViewProps, ViewStyle } from 'react-native';

interface GlassContainerProps extends ViewProps {
    children: React.ReactNode;
    className?: string;
    style?: StyleProp<ViewStyle>;
    intensity?: 'light' | 'medium' | 'heavy';
}

export default function GlassContainer({
    children,
    className = '',
    style,
    intensity = 'medium',
    ...props
}: GlassContainerProps) {

    // Map intensity to opacity levels
    const bgOpacity = {
        light: 'bg-zinc-900/40',
        medium: 'bg-zinc-900/60',
        heavy: 'bg-zinc-900/80',
    }[intensity];

    return (
        <View
            className={`rounded-3xl border border-zinc-800/80 overflow-hidden ${bgOpacity} ${className}`}
            style={style}
            {...props}
        >
            {children}
        </View>
    );
}
