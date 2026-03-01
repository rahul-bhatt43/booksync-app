import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet';
import React, { forwardRef, useCallback, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface DetailsDrawerProps {
    bookData: any;
}

const DetailsDrawer = forwardRef<BottomSheetModal, DetailsDrawerProps>(({ bookData }, ref) => {
    const snapPoints = useMemo(() => ['50%', '80%'], []);

    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.7} />
        ),
        []
    );

    return (
        <BottomSheetModal
            ref={ref}
            index={0}
            snapPoints={snapPoints}
            backdropComponent={renderBackdrop}
            backgroundStyle={{ backgroundColor: '#18181b' }}
            handleIndicatorStyle={{ backgroundColor: '#52525b' }}
            enablePanDownToClose={true}
        >
            <BottomSheetView style={styles.header}>
                <Text style={styles.title}>About</Text>
            </BottomSheetView>

            <BottomSheetScrollView contentContainerStyle={styles.contentContainer}>
                {bookData ? (
                    <>
                        <Text style={styles.bookTitle}>{bookData.title}</Text>
                        <Text style={styles.authorName}>By {bookData.authorId?.name || bookData.author?.name || 'Unknown Author'}</Text>

                        <View style={styles.metaContainer}>
                            {bookData.genre ? (
                                <View style={styles.metaBadge}>
                                    <Text style={styles.metaText}>{bookData.genre}</Text>
                                </View>
                            ) : null}
                            {bookData.language && (
                                <View style={styles.metaBadge}>
                                    <Text style={styles.metaText}>{bookData.language}</Text>
                                </View>
                            )}
                        </View>

                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.description}>
                            {bookData.description || 'No description available for this audiobook.'}
                        </Text>
                    </>
                ) : (
                    <Text style={styles.emptyText}>Loading details...</Text>
                )}
            </BottomSheetScrollView>
        </BottomSheetModal>
    );
});

const styles = StyleSheet.create({
    header: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
        alignItems: 'center',
        backgroundColor: '#18181b',
    },
    title: {
        fontSize: 18,
        fontFamily: 'Inter-Bold',
        color: 'white',
    },
    contentContainer: {
        padding: 24,
        paddingBottom: 40,
        paddingTop: 80,
    },
    bookTitle: {
        fontSize: 22,
        fontFamily: 'Inter-Bold',
        color: 'white',
        marginBottom: 8,
    },
    authorName: {
        fontSize: 16,
        fontFamily: 'Inter-Medium',
        color: '#06b6d4', // cyan-500
        marginBottom: 16,
    },
    metaContainer: {
        flexDirection: 'row',
        marginBottom: 24,
        flexWrap: 'wrap',
        gap: 8,
    },
    metaBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    metaText: {
        color: '#d4d4d8',
        fontFamily: 'Inter-Medium',
        fontSize: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'Inter-SemiBold',
        color: 'white',
        marginBottom: 12,
    },
    description: {
        fontSize: 15,
        lineHeight: 24,
        fontFamily: 'Inter-Regular',
        color: '#a1a1aa',
    },
    emptyText: {
        color: '#a1a1aa',
        fontFamily: 'Inter-Regular',
        textAlign: 'center',
        marginTop: 20,
    }
});

export default DetailsDrawer;
