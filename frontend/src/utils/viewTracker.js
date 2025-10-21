function getList(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

export function markViewed(key, id) {
  const list = getList(key);
  if (!list.includes(id)) {
    list.push(id);
    localStorage.setItem(key, JSON.stringify(list));
  }
}

export function isViewed(key, id) {
  return getList(key).includes(id);
}
