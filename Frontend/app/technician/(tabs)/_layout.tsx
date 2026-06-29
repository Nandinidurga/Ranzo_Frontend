import React, { useEffect, useState } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing } from '@/core/theme';
import { Pressable, View, Modal, Text, StyleSheet, Vibration, DeviceEventEmitter } from 'react-native';
import { useAuthStore } from '@/data/store';
import { wsUrl } from '@/core/config/api';
import { Booking } from '@/core/api/bookings';
import { RanzoButton } from '@/core/widgets';

export default function TechnicianTabsLayout() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const [incomingBooking, setIncomingBooking] = useState<Booking | null>(null);

  // Global WebSocket connection for technician
  useEffect(() => {
    if (!token) return;
    let ws: WebSocket;
    let timeout: NodeJS.Timeout;

    const connectWebSocket = () => {
      ws = new WebSocket(`${wsUrl('/api/v1/bookings/ws')}?token=${token}`);

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          const data = payload.data || {};
          
          if (payload.event === 'new_booking') {
            Vibration.vibrate([1000, 2000, 1000, 2000, 1000, 2000]);
            setIncomingBooking(data);
            DeviceEventEmitter.emit('refresh_bookings');
          }
          else if (payload.event === 'booking_updated') {
            if (data.status === 'CANCELLED_BY_CUSTOMER') {
              if (incomingBooking?.id === data.id) {
                setIncomingBooking(null);
                Vibration.cancel();
              }
            }
            DeviceEventEmitter.emit('refresh_bookings');
          }
        } catch (e) {}
      };

      ws.onclose = () => {
        timeout = setTimeout(connectWebSocket, 3000);
      };
    };

    connectWebSocket();

    return () => {
      clearTimeout(timeout);
      if (ws) ws.close();
      Vibration.cancel();
    };
  }, [token, incomingBooking]);

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.inkMuted,
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="home_redirect"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              router.replace('/home' as any);
            },
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: 'Bookings',
            tabBarIcon: ({ color, size }) => <Ionicons name="list-outline" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="wallet"
          options={{
            title: 'Wallet',
            tabBarIcon: ({ color, size }) => <Ionicons name="wallet-outline" size={size} color={color} />,
          }}
        />
      </Tabs>

      {/* Global INCOMING BOOKING MODAL */}
      <Modal
        visible={!!incomingBooking}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setIncomingBooking(null);
          Vibration.cancel();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="notifications-circle" size={48} color={Colors.white} />
              <Text style={styles.modalTitle}>New Job Request!</Text>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.modalCategory}>{incomingBooking?.category}</Text>
              <Text style={styles.modalProblem}>{incomingBooking?.problem_description}</Text>

              <View style={styles.modalActions}>
                <RanzoButton
                  label="Skip"
                  onPress={() => {
                    setIncomingBooking(null);
                    Vibration.cancel();
                  }}
                  type="outline"
                  style={{ flex: 1 }}
                />
                <RanzoButton
                  label="Show Details"
                  onPress={() => {
                    Vibration.cancel();
                    const b = incomingBooking;
                    setIncomingBooking(null);
                    if (b) {
                      router.push({
                        pathname: '/technician/booking-details',
                        params: { booking: JSON.stringify(b) }
                      } as any);
                    }
                  }}
                  style={{ flex: 1, backgroundColor: Colors.primary }}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  modalHeader: {
    backgroundColor: Colors.primary,
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  modalTitle: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '800',
  },
  modalBody: {
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
  },
  modalCategory: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.inkNavy,
    textAlign: 'center',
  },
  modalProblem: {
    fontSize: 16,
    color: Colors.inkNormal,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
    marginTop: Spacing.sm,
  },
});
