import { useState } from 'react';
import { FlatList, Modal, Pressable, Text, View } from 'react-native';

import { Envelope } from '@/types';

type EnvelopePickerProps = {
  envelopes: Envelope[];
  value: string;
  onChange: (envelopeId: string) => void;
};

export function EnvelopePicker({ envelopes, value, onChange }: EnvelopePickerProps) {
  const [isOpen, setOpen] = useState(false);
  const selected = envelopes.find((env) => env.id === value);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        className="text-input flex-row items-center justify-between">
        {selected ? (
          <View className="flex-row items-center">
            <View
              className="w-3 h-3 rounded-sm mr-2"
              style={{ backgroundColor: selected.color }}
            />
            <Text className="text-grey-400 dark:text-white">{selected.title}</Text>
          </View>
        ) : (
          <Text className="text-grey-300">Select an envelope</Text>
        )}
        <Text className="text-grey-300">▾</Text>
      </Pressable>

      <Modal visible={isOpen} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable onPress={() => setOpen(false)} className="modal-bg flex-1">
          <Pressable className="modal-main w-5/6 self-center my-auto" onPress={() => {}}>
            <Text className="header text-lg font-semibold text-grey-400 dark:text-white">
              Pick an envelope
            </Text>
            <FlatList
              data={envelopes}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    onChange(item.id);
                    setOpen(false);
                  }}
                  className={`flex-row items-center py-3 border-b border-grey-100 ${
                    value === item.id ? 'bg-grey-50' : ''
                  }`}>
                  <View
                    className="w-4 h-4 rounded-sm mr-3"
                    style={{ backgroundColor: item.color }}
                  />
                  <Text className="flex-1 text-grey-400 dark:text-white">{item.title}</Text>
                  <Text className="text-sm text-grey-300">${item.budget}</Text>
                </Pressable>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
