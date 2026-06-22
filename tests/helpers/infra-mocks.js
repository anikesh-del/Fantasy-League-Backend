const mockQuery = jest.fn();
const mockConnect = jest.fn();

jest.mock('pg', () => ({
  Pool: jest.fn(() => ({
    query: mockQuery,
    connect: mockConnect,
    on: jest.fn(),
  })),
}));
 
jest.mock('ioredis', () => {
  const redis = {
    connect: jest.fn().mockResolvedValue(undefined),
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    scan: jest.fn().mockResolvedValue(['0', []]),
    eval: jest.fn().mockResolvedValue([1, 1, Date.now() + 60000]),
    on: jest.fn(),
  };
  return jest.fn(() => redis);
});
 
jest.mock('bullmq', () => ({
  Worker: jest.fn(() => ({ on: jest.fn() })),
  Queue: jest.fn(() => ({
    add: jest.fn().mockResolvedValue({ id: 'job-1' }),
    upsertJobScheduler: jest.fn().mockResolvedValue(undefined),
    on: jest.fn(),
  })),
}));
 

module.exports = { mockQuery,mockConnect };