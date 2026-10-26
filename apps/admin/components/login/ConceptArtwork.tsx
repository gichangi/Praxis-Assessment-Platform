export function CivicArtwork() {
  return (
    <svg className="civic-art" viewBox="0 0 560 210" fill="none" aria-hidden="true">
      <path d="M0 192H560M20 207H540" stroke="#BD9A7D" strokeWidth="1" />
      <path d="M62 192V100H140V192M78 100V66H124V100M94 66V36" stroke="#99553C" strokeWidth="2" />
      <path
        d="M160 192V137H225V192M243 192V82H337V192M262 82V60H318V82M355 192V113H423V192M444 192V63H500V192"
        fill="#E6D8C7"
      />
      <path
        d="M243 192V82H337V192M262 82V60H318V82M444 192V63H500V192"
        stroke="#99553C"
        strokeWidth="1.5"
      />
      {[104, 132, 160].map((y) => (
        <path
          key={y}
          d={`M263 ${y}H275M286 ${y}H298M310 ${y}H322M460 ${y}H482`}
          stroke="#99553C"
          strokeWidth="2"
        />
      ))}
      <path
        d="M97 192V154H116V192M171 153H214M171 168H214M369 134H409M369 153H409M369 171H409"
        stroke="#99553C"
        strokeWidth="1.5"
      />
      <circle cx="185" cy="60" r="24" fill="#D8A279" opacity=".55" />
      <path
        d="M28 192V139M17 165L28 139L39 165M523 192V121M507 157L523 121L539 157"
        stroke="#777C54"
        strokeWidth="2"
      />
      <path d="M335 27H409M352 40H426" stroke="#BD9A7D" strokeWidth="1" />
    </svg>
  );
}

export function AtlasArtwork() {
  return (
    <svg className="atlas-art" viewBox="0 0 600 500" fill="none" aria-hidden="true">
      <defs>
        <pattern id="atlas-grid" width="35" height="35" patternUnits="userSpaceOnUse">
          <path d="M35 0H0V35" stroke="white" strokeOpacity=".09" />
        </pattern>
        <linearGradient id="atlas-area" x1="125" y1="40" x2="460" y2="450">
          <stop stopColor="#D7E7FF" stopOpacity=".35" />
          <stop offset="1" stopColor="#D7E7FF" stopOpacity=".03" />
        </linearGradient>
      </defs>
      <rect width="600" height="500" fill="url(#atlas-grid)" />
      <path
        d="M142 54L258 36L301 86L402 61L474 138L449 207L492 272L430 331L443 423L333 457L279 406L181 422L144 343L90 299L117 219L79 148Z"
        fill="url(#atlas-area)"
        stroke="#C9DCFF"
        strokeOpacity=".55"
      />
      <path
        d="M142 54L190 142L301 86L290 206L449 207M190 142L117 219L236 300L290 206L337 337L430 331M236 300L181 422M337 337L333 457M90 299L236 300L279 406M402 61L365 163L449 207M492 272L337 337L443 423"
        stroke="#C9DCFF"
        strokeOpacity=".4"
      />
      <path
        d="M190 142L290 206L337 337L236 300Z"
        stroke="white"
        strokeWidth="1.5"
        strokeDasharray="5 7"
      />
      {[
        [190, 142],
        [290, 206],
        [337, 337],
        [236, 300],
        [402, 61],
        [181, 422],
        [474, 138],
      ].map(([x, y], index) => (
        <g key={index}>
          <circle cx={x} cy={y} r={index < 4 ? 15 : 9} fill="white" fillOpacity=".12" />
          <circle cx={x} cy={y} r={index < 4 ? 4 : 2.5} fill={index === 1 ? "#BDFFCB" : "white"} />
        </g>
      ))}
      <rect x="323" y="175" width="131" height="49" rx="8" fill="white" />
      <circle cx="341" cy="192" r="3" fill="#315BE8" />
      <text x="351" y="196" fontSize="10" fontFamily="sans-serif" fill="#234074">
        Connected workspace
      </text>
      <text x="339" y="212" fontSize="8" fontFamily="sans-serif" fill="#64738B">
        From the field to your team
      </text>
      <path d="M34 50H63M48 36V65M523 434H552M537 420V449" stroke="white" strokeOpacity=".6" />
    </svg>
  );
}

export function FieldArtwork() {
  return (
    <svg className="field-art" viewBox="0 0 560 420" fill="none" aria-hidden="true">
      <defs>
        <clipPath id="field-clip">
          <rect width="560" height="420" rx="24" />
        </clipPath>
      </defs>
      <g clipPath="url(#field-clip)">
        <rect width="560" height="420" fill="#DDE4CD" />
        <circle cx="409" cy="95" r="47" fill="#EFCD79" />
        <path d="M-10 258C97 129 186 181 261 232C327 276 409 176 576 181V420H-10Z" fill="#A4B288" />
        <path d="M-10 328C61 224 182 263 238 299C321 352 420 210 576 274V420H-10Z" fill="#6E8C65" />
        <path
          d="M-10 381C127 289 197 354 289 376C373 396 453 331 576 363V420H-10Z"
          fill="#335C48"
        />
        <path
          d="M305 420C335 359 292 339 319 302C338 277 370 256 392 228"
          stroke="#F0E4BC"
          strokeWidth="19"
        />
        <path
          d="M305 420C335 359 292 339 319 302C338 277 370 256 392 228"
          stroke="#FAF4DD"
          strokeWidth="2"
          strokeDasharray="5 9"
        />
        <path
          d="M100 324V225M74 286L100 225L126 286Z"
          fill="#335C48"
          stroke="#335C48"
          strokeWidth="5"
        />
        <path
          d="M138 335V266M120 306L138 266L156 306Z"
          fill="#335C48"
          stroke="#335C48"
          strokeWidth="4"
        />
        <path d="M422 324V262H481V324" fill="#F5EDD8" />
        <path d="M412 265L451 235L490 265" fill="#365846" />
        <rect x="445" y="287" width="13" height="37" fill="#7D8C6B" />
        <path d="M431 278H439M465 278H473" stroke="#7D8C6B" strokeWidth="7" />
        <path
          d="M59 113H124M77 128H143M187 62H236"
          stroke="#FAF6EA"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M228 151L234 148L240 151M249 139L255 136L261 139"
          stroke="#637D5B"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M-10 360C106 287 178 320 252 355M-10 373C106 300 178 333 252 368"
          stroke="#C7D2A9"
          strokeOpacity=".45"
        />
      </g>
    </svg>
  );
}
