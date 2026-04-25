import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, Text } from 'react-native';

type DateFieldProps = {
  value: string;
  onChange: (isoDate: string) => void;
};

const iso = (d: Date) => d.toISOString().slice(0, 10);

export function DateField({ value, onChange }: DateFieldProps) {
  const [isPickerOpen, setPickerOpen] = useState(false);
  const asDate = value ? new Date(value + 'T00:00:00') : new Date();

  const handleChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS !== 'ios') setPickerOpen(false);
    if (selectedDate) onChange(iso(selectedDate));
  };

  return (
    <>
      <Pressable onPress={() => setPickerOpen(true)} className="text-input">
        <Text className="text-grey-400 dark:text-white">{value || 'Pick a date'}</Text>
      </Pressable>
      {isPickerOpen ? (
        <DateTimePicker
          value={asDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={handleChange}
        />
      ) : null}
    </>
  );
}
