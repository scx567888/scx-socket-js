/**
 * 消息 (无需 ACK)
 */
const MESSAGE = 0;

/**
 * 消息 (需要 ACK)
 */
const RESPONSE = 1;

/**
 * ACK
 */
const ACK = 2;

/**
 * 心跳 ping
 */
const PING = 3;

/**
 * 心跳 pong
 */
const PONG = 4;

export {MESSAGE, RESPONSE, ACK, PING, PONG};
