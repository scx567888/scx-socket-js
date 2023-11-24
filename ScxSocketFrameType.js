/**
 * 消息 (无需 ACK)
 */
const MESSAGE = 0;

/**
 * 消息 (需要 ACK)
 */
const MESSAGE_NEED_ACK = 1;

/**
 * ACK
 */
const ACK = 2;

/**
 * 心跳 ping
 */
const HEART_BEAT_PING = 3;

/**
 * 心跳 pong
 */
const HEART_BEAT_PONG = 4;

export {MESSAGE, MESSAGE_NEED_ACK, ACK, HEART_BEAT_PING, HEART_BEAT_PONG};
