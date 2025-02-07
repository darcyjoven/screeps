import { getBodyConfig } from "./creep"; // 请根据你的文件结构调整路径
import { getMockCreep } from "../../test/mock/creep";


describe("getBodyConfig", () => {
  test("应该返回 Harvester 在 Controller 1 级的身体配置", () => {
    const result = getBodyConfig('Harvester', 1);
    expect(result).toEqual([WORK, WORK, CARRY, MOVE]); // 需要根据实际的 Harvester 配置调整
  });

  test("应该返回 Harvester 在 Controller 5 级的身体配置", () => {
    const result = getBodyConfig('Harvester', 5);
    expect(result?.filter(item => item === WORK).length).toEqual(10)
    expect(result?.filter(item => item === CARRY).length).toEqual(1)
    expect(result?.filter(item => item === MOVE).length).toEqual(5)
  });

  test("应该返回 Manager 在 Controller 8 级的身体配置", () => {
    const result = getBodyConfig('Harvester', 8);
    expect(result?.filter(item => item === WORK).length).toEqual(12)
    expect(result?.filter(item => item === CARRY).length).toEqual(1)
    expect(result?.filter(item => item === MOVE).length).toEqual(6)
  });

  test("应该返回 Claimer 在 Controller 4 级的身体配置", () => {
    const result = getBodyConfig('Claimer', 4);
    expect(result).toEqual([CLAIM]); // Claimer 在各级别的配置似乎相同
  });

  test("应该返回 null 当传入无效角色时", () => {
    const result = getBodyConfig("UnknownRole" as any, 3);
    expect(result).toBeNull();
  });

  test("应该返回最低级别配置当 Controller 级别超出范围", () => {
    const result = getBodyConfig('Harvester', 10); // 级别超出 1~8
    expect(result).toEqual([WORK, WORK, CARRY, MOVE]); // 使用默认级别配置
  });
});

it('mock Creep 可以正常使用', () => {
  // 创建一个 creep 并指定其属性
  const creep = getMockCreep({
    name: 'test',
    ticksToLive: 100,
  })

  expect(creep.name).toBe('test')
  expect(creep.ticksToLive).toBe(100)
})