import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatTime } from '../utils/timeUtils';

const MessageBubble = ({ message, currentUserId }) => {
  const isMine = message.senderId === currentUserId;

  const getTimeLabel = () => {
    if (!message.timestamp) return '';
    return formatTime(message.timestamp);
  };

  return (
    <View style={[styles.wrapper, isMine ? styles.wrapperMine : styles.wrapperTheirs]}>
      <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
        <Text style={[styles.text, isMine ? styles.textMine : styles.textTheirs]}>
          {message.text}
        </Text>
      </View>
      <Text style={[styles.timestamp, isMine ? styles.timestampMine : styles.timestampTheirs]}>
        {getTimeLabel()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 3,
    marginHorizontal: 12,
    maxWidth: '70%',
  },
  wrapperMine: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  wrapperTheirs: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleMine: {
    backgroundColor: '#8B5CF6',
    borderBottomRightRadius: 4,
  },
  bubbleTheirs: {
    backgroundColor: '#F0F0F5',
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: 15,
    lineHeight: 21,
  },
  textMine: {
    color: '#FFFFFF',
  },
  textTheirs: {
    color: '#1F2937',
  },
  timestamp: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 3,
    marginHorizontal: 4,
  },
  timestampMine: {
    textAlign: 'right',
  },
  timestampTheirs: {
    textAlign: 'left',
  },
});

export default MessageBubble;
