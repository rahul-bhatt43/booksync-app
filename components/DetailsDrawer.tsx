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
            backgroundStyle={{ backgroundColor: 'hsl(12 6.5% 15.1%)' }}
            handleIndicatorStyle={{ backgroundColor: 'hsl(24 5.4% 63.9%)' }}
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
        borderBottomColor: 'hsla(60, 9.1%, 97.8%, 0.05)',
        alignItems: 'center',
        backgroundColor: 'hsl(12 6.5% 15.1%)',
    },
    title: {
        fontSize: 18,
        fontFamily: 'Inter-Bold',
        color: 'hsl(60 9.1% 97.8%)',
    },
    contentContainer: {
        padding: 24,
        paddingBottom: 40,
        paddingTop: 80,
    },
    bookTitle: {
        fontSize: 22,
        fontFamily: 'Inter-Bold',
        color: 'hsl(60 9.1% 97.8%)',
        marginBottom: 8,
    },
    authorName: {
        fontSize: 16,
        fontFamily: 'Inter-Medium',
        color: 'hsl(20.5 90.2% 48.2%)', // primary
        marginBottom: 16,
    },
    metaContainer: {
        flexDirection: 'row',
        marginBottom: 24,
        flexWrap: 'wrap',
        gap: 8,
    },
    metaBadge: {
        backgroundColor: 'hsla(60, 9.1%, 97.8%, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    metaText: {
        color: 'hsl(60 9.1% 97.8%)',
        fontFamily: 'Inter-Medium',
        fontSize: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'Inter-SemiBold',
        color: 'hsl(60 9.1% 97.8%)',
        marginBottom: 12,
    },
    description: {
        fontSize: 15,
        lineHeight: 24,
        fontFamily: 'Inter-Regular',
        color: 'hsl(24 5.4% 63.9%)',
    },
    emptyText: {
        color: '#a1a1aa',
        fontFamily: 'Inter-Regular',
        textAlign: 'center',
        marginTop: 20,
    }
});

export default DetailsDrawer;
