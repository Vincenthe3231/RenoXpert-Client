export const getFetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}`);
  }
  return res.json();
};

const getBody = (payload?: any) => {
  if (payload && typeof payload === "object" && "arg" in payload) {
    return (payload as { arg: any }).arg;
  }
  return payload;
};

export const postFetcher = async (url: string, payload?: any) => {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(getBody(payload)),
  });
  if (!res.ok) {
    throw new Error(`Failed to post ${url}`);
  }
  return res.json();
};

export const putFetcher = async (url: string, payload?: any) => {
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(getBody(payload)),
  });
  if (!res.ok) {
    throw new Error(`Failed to put ${url}`);
  }
  return res.json();
};

export const deleteFetcher = async (url: string, payload?: any) => {
  const res = await fetch(url, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(getBody(payload)),
  });
  if (!res.ok) {
    throw new Error(`Failed to delete ${url}`);
  }
  return res.json();
};

