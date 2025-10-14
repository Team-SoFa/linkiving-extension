module.exports = {
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "Feat",
        "Fix",
        "Docs",
        "Style",
        "Refactor",
        "Test",
        "Chore",
        "Design",
        "Comment",
        "Rename",
        "Remove",
      ],
    ],
    "type-case": [2, "always", "pascal-case"],
    "type-empty": [2, "never"],
    "subject-empty": [2, "never"],
    "subject-full-stop": [2, "never", "."],
    "header-max-length": [2, "always", 100],
    "my-custom-header-format": [2, "always"],
    "body-format-check": [2, "always"],
  },
  plugins: [
    {
      rules: {
        "my-custom-header-format": ({ header }) => {
          const valid = /^([A-Z][a-z]+):\s.+\s\(#[0-9]+\)$/.test(header);
          return [
            valid,
            '❌ 커밋 제목은 "Type: Title (#123)" 형식이어야 합니다.',
          ];
        },
        "body-format-check": ({ raw }) => {
          // raw 전체 커밋 메시지를 사용하여 더 정확한 파싱
          if (!raw) return [true];

          const lines = raw.split("\n");

          if (lines.length > 1) {
            const secondLine = lines[1];

            if (secondLine.trim() !== "") {
              return [false, "❌ 제목과 본문 사이에 빈 줄이 필요합니다."];
            }

            const bodyLines = lines.slice(2);
            const invalidLine = bodyLines.find(
              (line) => line.trim() && !line.trim().startsWith("-"),
            );

            if (invalidLine) {
              return [
                false,
                `❌ 본문의 각 줄은 '-'로 시작해야 합니다. 문제 있는 줄: "${invalidLine.trim()}"`,
              ];
            }
          }

          return [true];
        },
      },
    },
  ],
};
