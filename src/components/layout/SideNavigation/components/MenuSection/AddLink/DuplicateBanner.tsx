import SVGIcon from '@/components/Icons/SVGIcon';
import Divider from '@/components/basics/Divider/Divider';

export default function DuplicateBanner() {
  return (
    <>
      <section className="px-6 py-8" role="status" aria-live="polite">
        <h1 className="font-title-md mb-5 text-[1.375rem] text-gray900">중복 저장한 링크</h1>
        <p className="font-body-md text-gray900">
          이 링크는 이미 저장되어 있습니다.
          <br />
          지금 입력한 내용으로 새로 덮어쓸까요, 아니면 기존 링크의 정보를 유지할까요?
        </p>
        <div className="font-body-md mt-4 flex items-center gap-3 text-gray900">
          <SVGIcon icon="IC_Warning" className="shrink-0 text-yellow500" />
          <p>새로 덮어쓸 경우, 기존 링크의 제목, 이미지, 요약, 메모가 사라집니다.</p>
        </div>
      </section>
      <Divider />
    </>
  );
}
