export function AuthBackgroundVector() {
  const dots = []

  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 6; col++) {
      dots.push(
        <circle
          key={`${row}-${col}`}
          cx={565 + col * 28}
          cy={78 + row * 28}
          r="2.15"
          fill="#9FBDF2"
          opacity="0.68"
        />,
      )
    }
  }

  return (
    <svg
      className="absolute inset-0 hidden h-full w-full md:block"
      viewBox="0 0 1448 1086"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="1448" height="1086" rx="28" fill="#FBFDFF" />
      <rect width="1448" height="1086" rx="28" fill="url(#mainGradient)" />

      <path
        d="M1163 0H1448V272C1397 242 1387 181 1348 124C1308 65 1239 19 1163 0Z"
        fill="#E8F1FF"
      />
      <path d="M1268 0H1448V88C1388 82 1322 48 1268 0Z" fill="#DCEAFF" />
      <path d="M1393 0H1448V55C1426 51 1405 35 1393 0Z" fill="#CFE1FF" />

      <path
        d="M0 792C74 871 198 840 333 844C523 850 676 884 812 1086H0V792Z"
        fill="#EDF4FF"
      />
      <path
        d="M0 884C161 986 326 969 526 947C659 932 765 960 848 1086H0V884Z"
        fill="#BAD3FF"
        fillOpacity="0.74"
      />
      <path
        d="M0 911C190 1052 389 990 604 990C720 990 793 1018 852 1086H0V911Z"
        fill="#8DB7FF"
        fillOpacity="0.34"
      />

      <path d="M1071 1086C1110 918 1235 785 1448 715V1086H1071Z" fill="#2F7DFF" />
      <path
        d="M1161 1086C1210 956 1320 861 1448 821V1086H1161Z"
        fill="#1767F2"
        fillOpacity="0.62"
      />
      <path
        d="M1071 1086C1118 911 1247 784 1448 714V770C1308 829 1202 938 1150 1086H1071Z"
        fill="#6FA5FF"
        fillOpacity="0.74"
      />

      <g opacity="0.72">
        <circle cx="78" cy="570" r="18" stroke="#D8E6FF" strokeWidth="1" />
        <circle cx="78" cy="570" r="35" stroke="#D8E6FF" strokeWidth="1" />
        <circle cx="78" cy="570" r="53" stroke="#D8E6FF" strokeWidth="1" />
        <circle cx="78" cy="570" r="70" stroke="#D8E6FF" strokeWidth="1" />
        <circle cx="78" cy="570" r="87" stroke="#D8E6FF" strokeWidth="1" />
        <circle cx="78" cy="570" r="104" stroke="#D8E6FF" strokeWidth="1" />
      </g>

      <circle cx="436" cy="229" r="15" fill="#C7D9FF" />

      <g>{dots}</g>

      <path
        d="M646 381C657 358 676 393 685 368C691 350 708 377 717 352C721 340 727 347 731 333"
        stroke="#8EAFF0"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <defs>
        <linearGradient id="mainGradient" x1="0" y1="0" x2="1448" y2="1086" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" />
          <stop offset="0.52" stopColor="#FBFDFF" />
          <stop offset="1" stopColor="#EEF5FF" />
        </linearGradient>
      </defs>
    </svg>
  )
}
