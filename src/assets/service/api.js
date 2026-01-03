export const fetchAPI = ({ url, setData }) => {
  fetch(url)
    .then((res) => {
      if (res.ok) return res.json();
      throw res;
    })
    .then(({ data }) => {
      setData(data);
    })
    .catch(async (err) => {
      const { message } = await err.json();
      console.log(message);
    });
};
