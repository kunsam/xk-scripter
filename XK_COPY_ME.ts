/** 本代码由小库前端ai生成 */

export interface RailingParamsDTO {
  /** 栏杆高度 （栏杆高度 + 反坎高度 = 总高度） */
  railingHeight: number;
  /** 反坎高度 */
  baseRailHeight: number;
  /** 栏杆后端 */
  railingThickness: number;
}

export enum RampComponentType {
  /** 普通 */
  NORMAL = 1,
  /** 无障碍 */
  BARRIER_FREE = 2,
}

export enum StepComponentType {
  /** 单侧，必定为下 */
  SINGLE = 1,
  /** 双侧相邻，必定为下、右 */
  CLOSED_SIDES = 2,
  /** 双侧对边，必定为左、右 */
  OPPOSITE_SIDES = 3,
  /** 三侧，必定为左、下、右 */
  THREE_SIDES = 4,
}

export enum RectEdgePosition {
  /** 上 */
  UP = 1,
  /** 下 */
  DOWN = 2,
  /** 左 */
  LEFT = 3,
  /** 右 */
  RIGHT = 4,
}
