const iterations = 1000;
const roomsCount = 50;
const messagesPerRoom = 200;

// Generate mock data
const data = Array.from({ length: roomsCount }, (_, i) => {
  return {
    id: i,
    chat_messages: Array.from({ length: messagesPerRoom }, (_, j) => ({
      content: `Message ${j}`,
      created_at: new Date(Date.now() - Math.random() * 10000000000).toISOString()
    }))
  };
});

// Benchmark 1: Sort with new Date
console.time('Sort with new Date');
for (let i = 0; i < iterations; i++) {
  const rooms1 = data.map(room => {
    const messages = [...room.chat_messages];
    const lastMsg = messages.sort((a, b) =>
      new Date(b.created_at) - new Date(a.created_at)
    )?.[0];
    return { id: room.id, lastMsg };
  });
}
console.timeEnd('Sort with new Date');

// Benchmark 2: Reduce with string comparison
console.time('Reduce string comparison');
for (let i = 0; i < iterations; i++) {
  const rooms2 = data.map(room => {
    let lastMsg = null;
    if (room.chat_messages?.length) {
      lastMsg = room.chat_messages.reduce((latest, current) =>
        current.created_at > latest.created_at ? current : latest
      );
    }
    return { id: room.id, lastMsg };
  });
}
console.timeEnd('Reduce string comparison');
