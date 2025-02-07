it('全局环境测试', () => {
    // 全局应定义了 Game
    expect(Game).toBeDefined()
    // 全局应定义了 lodash
    expect(_).toBeDefined()
    // 全局的 Memory 应该定义且包含基础的字段
    expect(Memory).toMatchObject({ rooms: {}, creeps: {} })
})