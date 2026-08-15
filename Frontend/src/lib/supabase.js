const createQueryBuilder = () => ({
  select: () => createQueryBuilder(),
  eq: () => createQueryBuilder(),
  order: () => Promise.resolve({ data: [], error: null }),
  insert: (values) => Promise.resolve({ data: values, error: null }),
});

export const supabase = {
  from: () => createQueryBuilder(),
};
