'use client';

import { useMemo, useState } from 'react';
import { assetUrl, importLegacyAsPose } from '@/lib/admin/api';
import type { LegacyAsset, LegacyMessage, Pose } from '@/lib/admin/types';
import type { Derived } from './AdminDashboard';
import { PoseImage, secondaryButton } from './ui';

interface LegacyViewProps {
  assets: LegacyAsset[];
  messages: LegacyMessage[];
  poses: Pose[];
  derived: Derived;
  onImported: () => Promise<void>;
}

/** 화면 이름 (선언 순서 = 표시 순서) */
const SCREEN_LABEL: Record<string, string> = {
  home: '홈',
  input: '기록 완료',
  streak_confirm: '스트릭 달성',
  status: '현황',
  history: '히스토리',
};

const TYPE_LABEL: Record<string, string> = {
  character: '캐릭터',
  background: '배경',
  face: '얼굴 아이콘',
};

interface StateBlock {
  key: string;
  screen: string;
  state_id: string;
  assets: LegacyAsset[];
  messages: LegacyMessage[];
}

export default function LegacyView({ assets, messages, poses, derived, onImported }: LegacyViewProps) {
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const posePaths = useMemo(() => new Set(poses.map((p) => p.storage_path)), [poses]);

  /** 화면 → 상태별 묶음 */
  const screens = useMemo(() => {
    const blocks = new Map<string, StateBlock>();
    const get = (screen: string, state_id: string) => {
      const key = `${screen}.${state_id}`;
      if (!blocks.has(key)) blocks.set(key, { key, screen, state_id, assets: [], messages: [] });
      return blocks.get(key)!;
    };
    assets.forEach((a) => get(a.screen, a.state_id).assets.push(a));
    messages.forEach((m) => get(m.screen, m.state_id).messages.push(m));

    const byScreen = new Map<string, StateBlock[]>();
    for (const b of blocks.values()) byScreen.set(b.screen, [...(byScreen.get(b.screen) ?? []), b]);
    const order = Object.keys(SCREEN_LABEL);
    const rank = (s: string) => (order.includes(s) ? order.indexOf(s) : order.length);
    return Array.from(byScreen.entries()).sort(([a], [b]) => rank(a) - rank(b));
  }, [assets, messages]);

  /** 포즈로 가져올 수 있는 캐릭터 이미지 (경로 기준 중복 제거) */
  const importable = useMemo(() => {
    const seen = new Set<string>();
    return assets.filter((a) => {
      if (a.asset_type !== 'character' || !a.storage_path.startsWith('characters/')) return false;
      if (posePaths.has(a.storage_path) || seen.has(a.storage_path)) return false;
      seen.add(a.storage_path);
      return true;
    });
  }, [assets, posePaths]);

  const runImport = async (targets: LegacyAsset[]) => {
    setBusy(targets.length === 1 ? targets[0].id : 'all');
    setNotice(null);
    const keys = new Set(poses.map((p) => p.pose_key));
    let done = 0;
    try {
      for (const asset of targets) {
        keys.add(await importLegacyAsPose(asset, keys));
        done++;
      }
      setNotice(`${done}장을 초안 포즈로 가져왔어요. 포즈 이미지 탭에서 확인하고 공개하세요.`);
    } catch (e) {
      setNotice(`${done}장 가져온 뒤 멈췄어요: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy(null);
      await onImported();
    }
  };

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">현재 앱 콘텐츠</h1>
          <p className="mt-1 max-w-2xl text-sm text-ink-soft">
            지금 배포된 앱이 쓰는 이미지와 멘트예요. 여기서는 볼 수만 있어요. 새 카드가 없는 상황에서는 이 콘텐츠가 그대로 나가요.
          </p>
        </div>
        {importable.length > 0 && (
          <button onClick={() => runImport(importable)} disabled={busy !== null} className={secondaryButton}>
            {busy === 'all' ? '가져오는 중…' : `캐릭터 이미지 ${importable.length}장 모두 포즈로 가져오기`}
          </button>
        )}
      </header>

      {notice && <p className="mb-5 rounded-xl bg-mint-pale px-4 py-3 text-sm text-mint-dark">{notice}</p>}

      {/* 화면 바로가기 */}
      <nav className="mb-6 flex flex-wrap gap-1.5" aria-label="화면 바로가기">
        {screens.map(([screen]) => (
          <a
            key={screen}
            href={`#legacy-${screen}`}
            className="rounded-full bg-white px-3 py-1 text-[13px] text-ink-soft ring-1 ring-line hover:text-ink"
          >
            {SCREEN_LABEL[screen] ?? screen}
          </a>
        ))}
      </nav>

      <div className="space-y-12">
        {screens.map(([screen, blocks]) => (
          <section key={screen} id={`legacy-${screen}`} className="scroll-mt-20">
            <h2 className="mb-4 text-lg font-bold">{SCREEN_LABEL[screen] ?? screen}</h2>
            <div className="space-y-4">
              {blocks.map((block) => {
                const situation = derived.situationByKey.get(block.key);
                return (
                  <article key={block.key} className="rounded-2xl bg-white p-4 ring-1 ring-line sm:p-5">
                    <div className="mb-3 flex flex-wrap items-baseline gap-x-3">
                      <h3 className="font-semibold">{situation?.label ?? block.state_id}</h3>
                      <span className="text-xs text-ink-muted">{block.key}</span>
                    </div>

                    {block.assets.length > 0 && (
                      <div className="mb-4 flex flex-wrap gap-3">
                        {block.assets.map((a) => {
                          const imported = posePaths.has(a.storage_path);
                          const canImport =
                            a.asset_type === 'character' && a.storage_path.startsWith('characters/');
                          return (
                            <figure key={a.id} className="w-28">
                              <div
                                className={`aspect-square rounded-xl p-1.5 ${
                                  a.asset_type === 'background' ? 'bg-paper' : 'bg-mint-pale'
                                }`}
                              >
                                <PoseImage
                                  src={assetUrl(a.storage_path)}
                                  alt={a.description ?? a.asset_key}
                                  className={`h-full w-full ${a.asset_type === 'background' ? 'rounded-lg object-cover' : ''}`}
                                />
                              </div>
                              <figcaption className="mt-1.5 space-y-1">
                                <p className="truncate text-xs text-ink-soft" title={a.storage_path}>
                                  {TYPE_LABEL[a.asset_type] ?? a.asset_type}
                                  <span className="text-ink-muted"> {a.asset_key}</span>
                                </p>
                                {canImport &&
                                  (imported ? (
                                    <span className="text-[11px] font-medium text-mint-strong">포즈로 가져옴</span>
                                  ) : (
                                    <button
                                      onClick={() => runImport([a])}
                                      disabled={busy !== null}
                                      className="text-[11px] font-semibold text-ink underline decoration-mint-strong underline-offset-2 disabled:opacity-40"
                                    >
                                      {busy === a.id ? '가져오는 중…' : '포즈로 가져오기'}
                                    </button>
                                  ))}
                              </figcaption>
                            </figure>
                          );
                        })}
                      </div>
                    )}

                    {block.messages.length > 0 ? (
                      <ul className="space-y-1.5">
                        {block.messages.map((m) => (
                          <li key={m.id} className="rounded-lg bg-paper px-3 py-2 text-sm text-ink">
                            {m.message_text}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      block.assets.length === 0 && (
                        <p className="text-xs text-ink-muted">이 상황에는 멘트가 없어요.</p>
                      )
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
