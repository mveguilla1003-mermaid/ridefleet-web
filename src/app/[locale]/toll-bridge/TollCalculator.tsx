'use client';

import { useState } from 'react';
import { useMessages, useTranslations } from 'next-intl';
import { Icon } from '@/components/Icons';
import { ButtonLink } from '@/components/ui';
import { routes } from '@/lib/site';

/**
 * The toll-leak calculator (`#calculadora`, linked from the site footer).
 *
 * This is the only stateful surface on the page, so it is the only part that
 * crosses the client boundary — the route itself stays a server component.
 * Every label, unit and result string is read from the `tollBridge` catalog;
 * the arithmetic and the clamping rules are the static page's, unchanged.
 */

type FieldKey = 'fleet' | 'cross' | 'rate' | 'leak' | 'hours' | 'wage';

type FieldSpec = {
  /** DOM id kept from the static page so the label/input pairing is identical. */
  id: string;
  min: number;
  max: number;
  step: number;
  def: string;
  decimal?: boolean;
  /** Currency prefix inside the input. */
  prefix?: boolean;
  /** Unit suffix inside the input. */
  suffix?: 'percent' | 'hours';
};

const FIELDS: Record<FieldKey, FieldSpec> = {
  fleet: { id: 'cFleet', min: 1, max: 5000, step: 1, def: '40' },
  cross: { id: 'cCross', min: 0, max: 600, step: 1, def: '34' },
  rate: { id: 'cRate', min: 0.1, max: 25, step: 0.05, def: '2.05', decimal: true, prefix: true },
  leak: { id: 'cLeak', min: 0, max: 100, step: 1, def: '22', suffix: 'percent' },
  hours: { id: 'cHours', min: 0, max: 400, step: 1, def: '12', suffix: 'hours' },
  wage: { id: 'cWage', min: 5, max: 200, step: 1, def: '24', decimal: true, prefix: true }
};

const ORDER: FieldKey[] = ['fleet', 'cross', 'rate', 'leak', 'hours', 'wage'];

type CalcMessages = {
  calc: { nocount: { items: string[] } };
};

export function TollCalculator() {
  const t = useTranslations('tollBridge.calc');
  const noCountItems = (useMessages() as unknown as { tollBridge: CalcMessages })
    .tollBridge.calc.nocount.items;

  const [raw, setRaw] = useState<Record<FieldKey, string>>({
    fleet: FIELDS.fleet.def,
    cross: FIELDS.cross.def,
    rate: FIELDS.rate.def,
    leak: FIELDS.leak.def,
    hours: FIELDS.hours.def,
    wage: FIELDS.wage.def
  });

  /** Same contract as the static `read()`: parse, fall back, clamp. */
  function read(key: FieldKey) {
    const spec = FIELDS[key];
    const parsed = parseFloat(raw[key]);
    const v = Number.isFinite(parsed) ? parsed : parseFloat(spec.def);
    return Math.min(spec.max, Math.max(spec.min, v));
  }

  const currency = t('units.currency');
  const money = (n: number) => currency + Math.round(n).toLocaleString('en-US');

  const f = read('fleet');
  const c = read('cross');
  const r = read('rate');
  const p = read('leak');
  const h = read('hours');
  const w = read('wage');

  const crossings = f * c;
  const tolls = crossings * r;
  const leakMo = tolls * (p / 100);
  const adminMo = h * w;
  const totalMo = leakMo + adminMo;
  const totalYr = totalMo * 12;
  const split1 = totalMo > 0 ? Math.round((leakMo / totalMo) * 100) : 0;

  return (
    <div className="calc reveal">
      <form
        className="calc-form"
        onSubmit={(e) => e.preventDefault()}
        aria-labelledby="calcTitle"
      >
        <p className="flab" id="calcTitle">
          <Icon name="i-gauge" />
          {t('title')}
        </p>

        <div className="cgrid">
          {ORDER.map((key) => {
            const spec = FIELDS[key];
            return (
              <div className="field" key={key}>
                <label htmlFor={spec.id}>{t(`fields.${key}`)}</label>
                <span className="inwrap">
                  {spec.prefix ? (
                    <span className="p" aria-hidden="true">
                      {currency}
                    </span>
                  ) : null}
                  <input
                    className={spec.prefix ? 'input pre' : 'input'}
                    id={spec.id}
                    name={spec.id}
                    type="number"
                    inputMode={spec.decimal ? 'decimal' : 'numeric'}
                    min={spec.min}
                    max={spec.max}
                    step={spec.step}
                    value={raw[key]}
                    onChange={(e) =>
                      setRaw((prev) => ({ ...prev, [key]: e.target.value }))
                    }
                  />
                  {spec.suffix ? (
                    <span className="u" aria-hidden="true">
                      {t(`units.${spec.suffix}`)}
                    </span>
                  ) : null}
                </span>
              </div>
            );
          })}
        </div>

        <p className="help">
          <Icon name="i-info" />
          {t('help')}
        </p>

        <div className="nocount">
          <p className="nch">{t('nocount.title')}</p>
          <ul>
            {noCountItems.map((item, i) => (
              <li key={i}>
                <Icon name="i-minus" />
                {item}
              </li>
            ))}
          </ul>
          <p className="ncf">{t('nocount.foot')}</p>
        </div>
      </form>

      <div className="calc-out" aria-live="polite">
        <p className="olab">
          <Icon name="i-trend" />
          {t('out.label')}
        </p>

        <div className="bigs">
          <div className="big">
            <span className="bl">{t('out.month')}</span>
            <span className="bv">{money(totalMo)}</span>
          </div>
          <div className="big big--yr">
            <span className="bl">{t('out.year')}</span>
            <span className="bv">{money(totalYr)}</span>
          </div>
        </div>

        <div className="brk">
          <p className="brow">
            <span className="bt">{t('out.crossings')}</span>
            <b>{Math.round(crossings).toLocaleString('en-US')}</b>
          </p>
          <p className="brow">
            <span className="bt">{t('out.tolls')}</span>
            <b>{money(tolls)}</b>
          </p>
          <p className="brow">
            <span className="bt">{t('out.leak')}</span>
            <span className="bx">
              {p}
              {t('units.percent')}
            </span>
            <b>{money(leakMo)}</b>
          </p>
          <p className="brow brow--muted">
            <span className="bt">{t('out.admin')}</span>
            <span className="bx">
              <span>{h.toLocaleString('en-US')}</span> {t('units.hours')}
            </span>
            <b>{money(adminMo)}</b>
          </p>
          <p className="brow brow--muted">
            <span className="bt">{t('out.perUnit')}</span>
            <b>{money(totalYr / f)}</b>
          </p>
        </div>

        <div className="splitbar" aria-hidden="true">
          <i className="sb1" style={{ width: `${split1}%` }} />
          <i className="sb2" style={{ width: `${100 - split1}%` }} />
        </div>
        <p className="sbkey" aria-hidden="true">
          <span>
            <i className="k1" />
            {t('out.key1')}
          </span>
          <span>
            <i className="k2" />
            {t('out.key2')}
          </span>
        </p>

        <p className="ofoot">{t('out.foot')}</p>

        <div className="btn-row">
          <ButtonLink href={routes.demo} icon="i-arrow-right">
            {t('out.cta')}
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
