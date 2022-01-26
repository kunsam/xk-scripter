/**
 * 栏杆
 */
 public class RailingParamsDTO {

  /** 栏杆高度 （栏杆高度 + 反坎高度 = 总高度） */
  private double railingHeight;

  /** 反坎高度 */
  private double baseRailHeight;

  /** 栏杆后端 */
  private double railingThickness;
}




/**
 * 坡道类型
 */
public enum RampComponentType implements IXkoolEnum {

  /** 普通 */
  NORMAL(1),

  /** 无障碍 */
  BARRIER_FREE(2);
}




/**
 * * 台阶类型
 *
 * <p>所有台阶都为矩形，共有上、下、左、右4个方向
 */
public enum StepComponentType implements IXkoolEnum {
  /** 单侧，必定为下 */
  SINGLE(1),
  /** 双侧相邻，必定为下、右 */
  CLOSED_SIDES(2),
  /** 双侧对边，必定为左、右 */
  OPPOSITE_SIDES(3),
  /** 三侧，必定为左、下、右 */
  THREE_SIDES(4);
}




/**
 * 矩形边的位置，上、下、左、右
 */
public enum RectEdgePosition implements IXkoolEnum {
  /** 上 */
  UP(1),
  /** 下 */
  DOWN(2),
  /** 左 */
  LEFT(3),
  /** 右 */
  RIGHT(4);
}