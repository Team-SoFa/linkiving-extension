const PROTOCOL_PATTERN = /^[a-zA-Z][a-zA-Z\d+.-]*:/;
const IPV4_PATTERN =
  /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

function isValidHostname(hostname: string) {
  return hostname === 'localhost' || hostname.includes('.') || IPV4_PATTERN.test(hostname);
}

export function normalizeHttpUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const candidate = PROTOCOL_PATTERN.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const parsed = new URL(candidate);

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }

    if (!isValidHostname(parsed.hostname)) {
      return null;
    }

    return parsed.toString();
  } catch {
    return null;
  }
}

export function getReadableUrlLabel(input: string): string {
  try {
    const parsed = new URL(input);
    const hostname = parsed.hostname.replace(/^www\./i, '');
    if (!hostname) return input;

    const [firstSegment] = hostname.split('.');
    if (!firstSegment) return hostname;

    return firstSegment
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  } catch {
    return input;
  }
}

export function getUnsupportedTabReason(input: string | undefined): string | null {
  if (!input?.trim()) {
    return '현재 탭 주소를 읽지 못했습니다.';
  }

  const trimmed = input.trim();
  const lower = trimmed.toLowerCase();

  if (lower.startsWith('chrome://') || lower.startsWith('chrome-extension://')) {
    return '브라우저 내부 페이지는 확장프로그램에서 저장할 수 없습니다.';
  }

  if (lower.startsWith('edge://') || lower.startsWith('about:') || lower.startsWith('file://')) {
    return '현재 탭은 일반 웹페이지가 아니라서 주소를 자동으로 가져올 수 없습니다.';
  }

  if (lower.startsWith('view-source:') || lower.startsWith('devtools://')) {
    return '개발자 도구나 소스 보기 페이지는 저장 대상이 아닙니다.';
  }

  if (!normalizeHttpUrl(trimmed)) {
    return '현재 탭 주소 형식이 지원되지 않습니다. http 또는 https 페이지에서 다시 시도해 주세요.';
  }

  return null;
}
