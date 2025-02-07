# creep 控制主要功能

1. 运维规划，不同controler等级进行不同数量的creep规划
2. 死亡收集，当creep死亡时通知到模块，判断是否进行重新孵化
3. 孵化任意creep，将孵化加入队列，允许插队
4. 锁定房间spawn，空闲释放spawn

## 私有功能

1. creep配置初始化
2. 孵化到待命处

# 运维 creep 介绍

- `harvester`: 低等级采集者，会自发的在脚下修建和维持 container。
- `collector`: 高等级采集者，只会把采集到的能量存放到指定建筑。
- `filler`: 低等级运输者，会执行房间内物流任务并在没有任务时尝试将能量转移至 storage。
- `manager`: 高等级运输者，只会执行房间内物流任务。
- `processor`: 中央物流管理员。
- `upgrader`：升级单位，只会取出能量，不会采集能量。
- `builder`：维修建筑，维修完成后升级 controller。

## 阶段1 占领或者重生之后

- 孵化两个 harvester，每个负责一个金矿
- 孵化一个 builder ，协助建造container

## 阶段2 container 建造完成

- 孵化 upgrader \* 2 进行controler升级
- harvester \* 2 filler \* 2 upgrader\*4

## 阶段三 storage 修建完成

- controler 等级到4时，自动建立storage 工地
- filler \* 2 向 strage 中填充能量
- manager 负责取出能量到需要的地方

## 阶段4 sourceLink/CenterLink 建成

- harvester -> collector 将能量转义到sourceLink
- container小时后filler停止孵化
- processor 负责中央物流
