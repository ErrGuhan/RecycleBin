/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  pageLandscape: {
    padding: 30,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
  },
  outerBorder: {
    borderWidth: 2,
    borderColor: '#00796B', // Bisleri strong aqua green
    padding: 24,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    backgroundColor: '#FAFCFC',
  },
  innerBorder: {
    borderWidth: 1,
    borderColor: '#D5E6E3',
    padding: 20,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00796B',
  },
  brandSubtitle: {
    fontSize: 9,
    color: '#4B635F',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  certNumber: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#0E2A27',
  },
  mainBody: {
    textAlign: 'center',
    marginVertical: 12,
  },
  certTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#0E2A27',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  presentedTo: {
    fontSize: 11,
    color: '#4B635F',
    marginTop: 8,
    fontStyle: 'italic',
  },
  studentName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00796B',
    marginTop: 6,
    textDecoration: 'underline',
  },
  citationText: {
    fontSize: 11,
    color: '#0E2A27',
    lineHeight: 1.6,
    marginTop: 12,
    maxWidth: 520,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  metricsRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
    marginTop: 14,
    paddingVertical: 8,
    backgroundColor: '#E0F5F2',
    borderRadius: 8,
    maxWidth: 420,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  metricBox: {
    textAlign: 'center',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00796B',
  },
  metricLabel: {
    fontSize: 8,
    color: '#4B635F',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  footer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#D5E6E3',
    paddingTop: 12,
  },
  qrBlock: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qrImage: {
    width: 54,
    height: 54,
  },
  qrText: {
    fontSize: 8,
    color: '#4B635F',
    maxWidth: 130,
    lineHeight: 1.3,
  },
  signatoryBlock: {
    textAlign: 'center',
    width: 180,
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#0E2A27',
    marginBottom: 4,
    height: 24,
  },
  signatoryName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0E2A27',
  },
  signatoryTitle: {
    fontSize: 8,
    color: '#4B635F',
  },
});

export interface CertificateData {
  certificateNo: string;
  studentName: string;
  tierName: string;
  campusName: string;
  itemsCount: number;
  estimatedKg: number;
  issueDate: string;
  qrDataUrl: string;
  signatoryName?: string;
  signatoryTitle?: string;
}

export function CertificatePDF({ data }: { data: CertificateData }) {
  return (
    <Document title={`Certificate - ${data.certificateNo}`} author="Campus Plastic Credits">
      <Page size="A4" orientation="landscape" style={styles.pageLandscape}>
        <View style={styles.outerBorder}>
          <View style={styles.innerBorder}>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.brandTitle}>Campus Plastic Credits</Text>
                <Text style={styles.brandSubtitle}>Bisleri Partner Sustainability Initiative</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.certNumber}>CERTIFICATE ID: {data.certificateNo}</Text>
                <Text style={{ fontSize: 8, color: '#4B635F', marginTop: 2 }}>
                  Issued: {data.issueDate}
                </Text>
              </View>
            </View>

            {/* Main Body */}
            <View style={styles.mainBody}>
              <Text style={styles.certTitle}>{data.tierName} Sustainability Award</Text>
              <Text style={styles.presentedTo}>This certificate of environmental excellence is awarded to</Text>
              <Text style={styles.studentName}>{data.studentName}</Text>
              <Text style={styles.citationText}>
                in recognition of outstanding personal contribution to campus waste diversion at{' '}
                {data.campusName}. Through verified plastic drop-offs, this student has demonstrated
                exemplary environmental stewardship in the circular economy.
              </Text>

              {/* Verified Metrics */}
              <View style={styles.metricsRow}>
                <View style={styles.metricBox}>
                  <Text style={styles.metricValue}>{data.itemsCount}</Text>
                  <Text style={styles.metricLabel}>Verified Items</Text>
                </View>
                <View style={styles.metricBox}>
                  <Text style={styles.metricValue}>~{data.estimatedKg} kg</Text>
                  <Text style={styles.metricLabel}>Estimated Plastic</Text>
                </View>
                <View style={styles.metricBox}>
                  <Text style={styles.metricValue}>{data.tierName}</Text>
                  <Text style={styles.metricLabel}>Earned Tier</Text>
                </View>
              </View>
            </View>

            {/* Footer with Verification QR and Signatory */}
            <View style={styles.footer}>
              {/* Verification QR */}
              <View style={styles.qrBlock}>
                <Image src={data.qrDataUrl} style={styles.qrImage} />
                <View>
                  <Text style={{ fontSize: 8, fontWeight: 'bold', color: '#0E2A27' }}>
                    Scan to Verify
                  </Text>
                  <Text style={styles.qrText}>
                    Public authenticity check with masked privacy protection
                  </Text>
                </View>
              </View>

              {/* Signatory */}
              <View style={styles.signatoryBlock}>
                <View style={styles.signatureLine} />
                <Text style={styles.signatoryName}>
                  {data.signatoryName || '[Authorized Signatory]'}
                </Text>
                <Text style={styles.signatoryTitle}>
                  {data.signatoryTitle || 'Campus Sustainability Director'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
