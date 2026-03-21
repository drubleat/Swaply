import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * SkillChip — evrensel yetenek etiketi
 * variant: 'teach' | 'learn' | 'selected' | 'unselected'
 */
const SkillChip = ({ skill, variant = 'teach' }) => {
  const chipStyle = variantStyles[variant] || variantStyles.teach;

  return (
    <View style={[styles.chip, chipStyle.bg]}>
      <Text style={[styles.text, chipStyle.text]}>{skill}</Text>
    </View>
  );
};

const variantStyles = {
  teach: {
    bg: { backgroundColor: '#8B5CF6' },
    text: { color: '#FFFFFF' },
  },
  learn: {
    bg: { backgroundColor: '#E5E7EB' },
    text: { color: '#1F2937' },
  },
  selected: {
    bg: { backgroundColor: '#8B5CF6' },
    text: { color: '#FFFFFF' },
  },
  unselected: {
    bg: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB' },
    text: { color: '#374151' },
  },
  match: {
    bg: { backgroundColor: '#EDE9FE' },
    text: { color: '#7C3AED' },
  },
};

const styles = StyleSheet.create({
  chip: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginRight: 8,
    marginBottom: 8,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
  },
});

export default SkillChip;
