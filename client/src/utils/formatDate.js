export default function formatDate(dateStr) {
    if (!dateStr) return '';
    const rawDate = dateStr.split('T')[0];
    const [year, month, day] = rawDate.split('-');
    return `${day}/${month}/${year}`;
  };