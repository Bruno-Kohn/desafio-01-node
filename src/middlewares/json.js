export async function json(req, res) {
  const methods = ['POST', 'PUT', 'PATCH'];
  
  if (!methods.includes(req.method)) {
    return;
  }

  const buffers = [];

  for await (const chunk of req) {
    buffers.push(chunk);
  }

  try {
    req.body = JSON.parse(Buffer.concat(buffers).toString());
  } catch {
    req.body = null;
  }

  res.setHeader("Content-type", "application/json");
}
