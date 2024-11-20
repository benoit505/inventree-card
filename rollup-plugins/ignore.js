export default function ignore(options = {}) {
  const files = options.files || [];
  return {
    name: 'ignore',
    resolveId(source) {
      if (files.includes(source)) {
        return source;
      }
      return null;
    },
    load(id) {
      if (files.includes(id)) {
        return '';
      }
      return null;
    },
  };
} 