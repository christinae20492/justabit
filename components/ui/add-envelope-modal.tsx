import { useState } from 'react';
import { Modal, Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';

import { NewEnvelope } from '@/types';

type AddEnvelopeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate?: (envelope: NewEnvelope) => void;
};

const PALETTE = [
  '#86bd75',
  '#52808D',
  '#E3AAB3',
  '#B22222',
  '#AFA72B',
  '#3A27B7',
  '#32EE90',
  '#7596A5',
];

export function AddEnvelopeModal({ isOpen, onClose, onCreate }: AddEnvelopeModalProps) {
  const [title, setTitle] = useState('');
  const [budget, setBudget] = useState('');
  const [fixed, setFixed] = useState(false);
  const [color, setColor] = useState(PALETTE[0]);
  const [comments, setComments] = useState('');

  const reset = () => {
    setTitle('');
    setBudget('');
    setFixed(false);
    setColor(PALETTE[0]);
    setComments('');
  };

  const handleSubmit = () => {
    const parsedBudget = Number(budget);
    if (!title.trim() || Number.isNaN(parsedBudget)) return;
    // TODO: wire to POST /api/envelopes via fetch when backend is ready.
    onCreate?.({
      title: title.trim(),
      fixed,
      budget: parsedBudget,
      expenses: [],
      icon: '',
      color,
      comments: comments.trim() || null,
    });
    reset();
    onClose();
  };

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <View className="modal-bg flex-1">
        <View className="modal-main">
          <Pressable
            onPress={onClose}
            className="w-6 h-6 rounded bg-red self-end items-center justify-center">
            <Text className="text-white font-bold">x</Text>
          </Pressable>

          <Text className="header text-xl font-semibold text-grey-400 dark:text-white">
            New Envelope
          </Text>

          <ScrollView>
            <Text className="text-grey-400 dark:text-white mt-2">Title</Text>
            <TextInput
              className="text-input text-grey-400 dark:text-white"
              value={title}
              onChangeText={setTitle}
              placeholder="Groceries"
              placeholderTextColor="#a3a3a3"
            />

            <Text className="text-grey-400 dark:text-white mt-4">Budget ($)</Text>
            <TextInput
              className="text-input text-grey-400 dark:text-white"
              value={budget}
              onChangeText={setBudget}
              keyboardType="decimal-pad"
              placeholder="500"
              placeholderTextColor="#a3a3a3"
            />

            <View className="flex-row items-center justify-between mt-4">
              <Text className="text-grey-400 dark:text-white">Fixed budget</Text>
              <Switch value={fixed} onValueChange={setFixed} />
            </View>

            <Text className="text-grey-400 dark:text-white mt-4">Color</Text>
            <View className="flex-row flex-wrap mt-2">
              {PALETTE.map((swatch) => (
                <Pressable
                  key={swatch}
                  onPress={() => setColor(swatch)}
                  className={`w-8 h-8 rounded-full mr-2 mb-2 ${
                    color === swatch ? 'border-2 border-grey-400' : ''
                  }`}
                  style={{ backgroundColor: swatch }}
                />
              ))}
            </View>

            <Text className="text-grey-400 dark:text-white mt-4">Comments</Text>
            <TextInput
              className="text-input text-grey-400 dark:text-white"
              value={comments}
              onChangeText={setComments}
              multiline
              numberOfLines={3}
              placeholder="Optional notes"
              placeholderTextColor="#a3a3a3"
            />
          </ScrollView>

          <Pressable
            onPress={handleSubmit}
            className="button mt-4 items-center">
            <Text className="text-grey-400 font-semibold">Create Envelope</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
