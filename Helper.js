const SCX_SOCKET_CLIENT_ID_KEY = "scx-socket-client-id";

/**
 * 生成 uuid
 * @returns {string}
 */
function getUUID() {
    const temp_url = URL.createObjectURL(new Blob());
    const uuid = temp_url.toString();
    URL.revokeObjectURL(temp_url);
    return uuid.substring(uuid.lastIndexOf("/") + 1);
}

/**
 * 根据次数获取延时时间
 * 根据次数进行 2的 次方倍增 , 如 1, 2 ,4 ,8 ,16 等
 *
 * @param times 次数 (0 起始)
 * @return 延时时间 (毫秒)
 */
function getDelayed(times) {
    return 1000 * (1 << times);
}

function createConnectOptions(uri, protocols, clientID) {
    const newUri = new URL(uri);
    newUri.searchParams.set(SCX_SOCKET_CLIENT_ID_KEY, clientID);
    return {
        uri: newUri,
        protocols: protocols,
    };
}

export {
    SCX_SOCKET_CLIENT_ID_KEY,
    getUUID,
    getDelayed,
    createConnectOptions,
};
