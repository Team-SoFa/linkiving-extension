interface SpinnerProps extends React.SVGProps<SVGSVGElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number; // 스피너 가로/세로 크기 (px)
  speed?: number; // 회전 속도 (초)
  ariaLabel?: string;
}

const strokeWidth = 2.1;
const bg_stroke_color = '#C7C8CD'; // gray200
const child_stroke_color = '#7A7C86'; // gray500

const Spinner = ({ size = 'md', speed = 1, ariaLabel = '로딩중' }: SpinnerProps) => {
  const sizeMap = {
    xs: 14,
    sm: 16,
    md: 18,
    lg: 20,
    xl: 24,
  };
  const spinnerSize = typeof size === 'number' ? size : sizeMap[size];
  const radius = (spinnerSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius; // 원의 둘레 길이

  return (
    <svg
      className="animate-spin"
      width={spinnerSize}
      height={spinnerSize}
      viewBox={`0 0 ${spinnerSize} ${spinnerSize}`}
      style={{
        animation: `spin ${speed}s linear infinite`,
      }}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={ariaLabel}
      focusable="false"
    >
      {/* 배경 원 */}
      <circle
        cx={spinnerSize / 2}
        cy={spinnerSize / 2}
        r={radius}
        stroke={bg_stroke_color}
        strokeWidth={strokeWidth}
        fill="none"
      />
      {/* 바 */}
      <circle
        cx={spinnerSize / 2}
        cy={spinnerSize / 2}
        r={radius}
        fill="transparent"
        stroke={child_stroke_color}
        strokeWidth={strokeWidth}
        strokeLinecap="round" // round, butt, square
        strokeDasharray={circumference} // 전체 바 길이
        strokeDashoffset={circumference * 0.7} // 보이지 않는 바 길이 (선의 시작 위치를 오프셋만큼 밀어냄)
      />
    </svg>
  );
};

export default Spinner;
