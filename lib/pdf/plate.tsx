/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  pageA4: {
    padding: 36,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  header: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#00796B',
    paddingBottom: 14,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: 'heavy',
    color: '#0E2A27',
  },
  brandSub: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#00796B',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  headlineBlock: {
    marginTop: 20,
    textAlign: 'center',
  },
  mainHeadline: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0E2A27',
    textAlign: 'center',
  },
  subHeadline: {
    fontSize: 13,
    color: '#4B635F',
    marginTop: 6,
    textAlign: 'center',
  },
  qrContainer: {
    alignItems: 'center',
    marginVertical: 18,
    padding: 16,
    borderWidth: 2,
    borderColor: '#D5E6E3',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  qrImage: {
    width: 250, // Approx 8.8 cm (>= 8 cm requirement)
    height: 250,
  },
  fallbackBlock: {
    textAlign: 'center',
    marginTop: 8,
  },
  fallbackUrl: {
    fontSize: 14,
    color: '#4B635F',
  },
  fallbackCode: {
    fontSize: 24,
    fontWeight: 'heavy',
    color: '#00796B',
    letterSpacing: 3,
    marginTop: 4,
  },
  stationDetails: {
    textAlign: 'center',
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#E0F5F2',
    borderRadius: 8,
    width: '90%',
  },
  stationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0E2A27',
  },
  stationLoc: {
    fontSize: 11,
    color: '#4B635F',
    marginTop: 2,
  },
  stepsStrip: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#D5E6E3',
    borderBottomWidth: 1,
    borderBottomColor: '#D5E6E3',
    marginVertical: 12,
  },
  stepItem: {
    textAlign: 'center',
    width: '30%',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00796B',
  },
  stepText: {
    fontSize: 10,
    color: '#0E2A27',
    marginTop: 2,
  },
  footer: {
    textAlign: 'center',
    width: '100%',
  },
  footerNotice: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0E2A27',
  },
  footerSub: {
    fontSize: 8,
    color: '#4B635F',
    marginTop: 4,
  },
});

export interface PlateData {
  binName: string;
  locationLabel: string;
  code: string;
  appUrl: string;
  qrDataUrl: string;
}

export function BinPlatePDF({ plate }: { plate: PlateData }) {
  const shortUrl = `${plate.appUrl.replace(/^https?:\/\//, '')}/b/${plate.code}`;

  return (
    <Document title={`Bin Plate - ${plate.code}`} author="Campus Plastic Credits">
      <Page size="A4" style={styles.pageA4}>
        {/* Brand Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandTitle}>Campus Plastic Credits</Text>
            <Text style={styles.brandSub}>Bisleri Partner Initiative</Text>
          </View>
          <View>
            <Text style={{ fontSize: 9, color: '#4B635F', textAlign: 'right' }}>
              Official Drop Station
            </Text>
          </View>
        </View>

        {/* Headline */}
        <View style={styles.headlineBlock}>
          <Text style={styles.mainHeadline}>Scan to log your plastic</Text>
          <Text style={styles.subHeadline}>
            Earn credit points toward verified sustainability certificates
          </Text>
        </View>

        {/* Big QR Code (>= 8 cm) */}
        <View style={styles.qrContainer}>
          <Image src={plate.qrDataUrl} style={styles.qrImage} />
        </View>

        {/* Station Details */}
        <View style={styles.stationDetails}>
          <Text style={styles.stationName}>{plate.binName}</Text>
          <Text style={styles.stationLoc}>{plate.locationLabel}</Text>
        </View>

        {/* Fallback Text if QR scanner fails */}
        <View style={styles.fallbackBlock}>
          <Text style={styles.fallbackUrl}>Or visit: {shortUrl}</Text>
          <Text style={styles.fallbackCode}>CODE: {plate.code}</Text>
        </View>

        {/* 3-Step Strip */}
        <View style={styles.stepsStrip}>
          <View style={styles.stepItem}>
            <Text style={styles.stepNumber}>1. Drop</Text>
            <Text style={styles.stepText}>Clean empty plastic</Text>
          </View>
          <View style={styles.stepItem}>
            <Text style={styles.stepNumber}>2. Scan</Text>
            <Text style={styles.stepText}>Point phone camera</Text>
          </View>
          <View style={styles.stepItem}>
            <Text style={styles.stepNumber}>3. Count</Text>
            <Text style={styles.stepText}>Log dropped items</Text>
          </View>
        </View>

        {/* Footer Warning */}
        <View style={styles.footer}>
          <Text style={styles.footerNotice}>Clean, empty plastic only</Text>
          <Text style={styles.footerSub}>
            Caps &amp; liquids removed • Verified by scale weighing • Audit traceable
          </Text>
        </View>
      </Page>
    </Document>
  );
}
