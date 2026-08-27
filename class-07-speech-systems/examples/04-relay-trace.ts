const turnId = crypto.randomUUID()
for (const type of ['audioFrame', 'transcriptFinal', 'speechChunk', 'turnDone']) console.log({ type, turnId })

