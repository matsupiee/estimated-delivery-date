type SpinnerProps = {
  size?: number;
};

export function Spinner({ size = 18 }: SpinnerProps) {
  return (
    <>
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          animation: "spin 1s linear infinite",
        }}
      >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
    </>
  );
}
