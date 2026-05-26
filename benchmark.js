const crypto = require('crypto');

// Generate mock data
const generateData = (numRooms, msgsPerRoom) => {
  const data = [];
  for (let i = 0; i < numRooms; i++) {
    const chat_messages = [];
    for (let j = 0; j < msgsPerRoom; j++) {
      chat_messages.push({
        content: `Message ${j}`,
        created_at: new Date(Date.now() - Math.random() * 10000000000).toISOString()
      });
    }
    data.push({
      id: i,
      profiles: { full_name: `User ${i}` },
      chat_messages
    });
  }
  return data;
};

const data = generateData(100, 1000); // 100 rooms, 1000 messages each

const baseline = () => {
  return data.map(room => {
    const sortedMsgs = (room.chat_messages || []).slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const lastMsg = sortedMsgs[0];

    return {
      ...room,
      userName: room.profiles?.full_name || 'Người dùng ẩn danh',
      lastMessage: lastMsg?.content || 'Chưa có tin nhắn',
      lastTime: lastMsg?.created_at
        ? new Date(lastMsg.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        : '',
    };
  });
};

const optimized = () => {
  return data.map(room => {
    let lastMsg = null;
    const msgs = room.chat_messages || [];
    if (msgs.length > 0) {
      lastMsg = msgs[0];
      let maxTime = new Date(lastMsg.created_at).getTime();
      for (let i = 1; i < msgs.length; i++) {
        const time = new Date(msgs[i].created_at).getTime();
        if (time > maxTime) {
          maxTime = time;
          lastMsg = msgs[i];
        }
      }
    }

    return {
      ...room,
      userName: room.profiles?.full_name || 'Người dùng ẩn danh',
      lastMessage: lastMsg?.content || 'Chưa có tin nhắn',
      lastTime: lastMsg?.created_at
        ? new Date(lastMsg.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        : '',
    };
  });
};

console.time('Baseline');
baseline();
console.timeEnd('Baseline');

console.time('Optimized');
optimized();
console.timeEnd('Optimized');

// Run multiple times for better accuracy
let baselineTime = 0;
let optimizedTime = 0;
const iterations = 50;

for (let i = 0; i < iterations; i++) {
  const start1 = performance.now();
  baseline();
  baselineTime += performance.now() - start1;

  const start2 = performance.now();
  optimized();
  optimizedTime += performance.now() - start2;
}

console.log(`\nAverage over ${iterations} iterations:`);
console.log(`Baseline: ${(baselineTime / iterations).toFixed(2)} ms`);
console.log(`Optimized: ${(optimizedTime / iterations).toFixed(2)} ms`);
console.log(`Improvement: ${(((baselineTime - optimizedTime) / baselineTime) * 100).toFixed(2)}%`);
