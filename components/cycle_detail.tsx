import React, { Dispatch, SetStateAction } from 'react';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';

dayjs.extend(localizedFormat);

import {
    CalendarIcon,
    CheckCircleIcon,
    ClipboardCheckIcon,
    ClipboardIcon,
    ClipboardListIcon,
    ClockIcon,
    DocumentIcon,
    DocumentReportIcon,
    DocumentTextIcon,
    ExclamationCircleIcon,
    FastForwardIcon,
    XCircleIcon,
} from '@components/icon';
import Divider from '@components/divider';
import Spinner from '@components/spinner';
import TimeElapse from '@components/time_elapse';
import { formatDate, isWithinTimeDuration } from '@lib/client_utils';
import { getCycleSummary } from '@lib/common_utils';
import { stateDone, stateOnQueue, stateStarted, stateTimedOut } from '@lib/constant';
import { CaseState, Cycle, SpecExecutionState } from '@types';

type Props = {
    cycle: Cycle;
    specsGroup?: Record<SpecExecutionState, number>;
    selectedSpecGroup?: SpecExecutionState;
    setSelectedSpecGroup: Dispatch<SetStateAction<SpecExecutionState | undefined>>;
    selectedCaseState?: CaseState;
    setSelectedCaseState: Dispatch<SetStateAction<CaseState | undefined>>;
};

function CycleDetail({
    cycle,
    specsGroup,
    selectedSpecGroup,
    setSelectedSpecGroup,
    selectedCaseState,
    setSelectedCaseState,
}: Props): React.ReactElement {
    if (!cycle?.id) {
        return <div />;
    }

    function setSelectedGroup(e: React.MouseEvent<HTMLDivElement>) {
        e.preventDefault();

        const targetEl = e.target as HTMLDivElement;
        const parentEl = targetEl.parentNode as HTMLDivElement;
        const group = (targetEl.dataset.group ||
            (parentEl && parentEl.dataset.group)) as SpecExecutionState;

        if (group !== selectedSpecGroup) {
            setSelectedSpecGroup(group);
            setSelectedCaseState(undefined);
        }
    }

    function setSelectedState(e: React.MouseEvent<HTMLDivElement>) {
        e.preventDefault();

        const targetEl = e.target as HTMLDivElement;
        const parentEl = targetEl.parentNode as HTMLDivElement;
        const state = (targetEl.dataset.state || (parentEl && parentEl.dataset.state)) as CaseState;

        if (state !== selectedCaseState) {
            setSelectedCaseState(state);
            setSelectedSpecGroup(undefined);
        }
    }

    const {
        repo,
        branch,
        build,
        state,
        pass,
        fail,
        known_fail,
        pending,
        skipped,
        specs_registered,
        browser_name,
        browser_version,
        os_name,
        os_version,
        cypress_version,
        node_version,
        start_at: startAt,
        end_at: endAt,
        create_at: createAt,
        update_at: updateAt,
    } = cycle;

    const end = endAt || updateAt;

    const { totalCases, passingRate, color } = getCycleSummary(cycle);
    const formattedStartDate = formatDate(startAt);

    function renderDate(name: string, dateAt: string) {
        return (
            <div className="flex space-x-2 text-gray-700" onClick={setSelectedState}>
                <p className="w-14">{`${name}: `}</p>
                <p>{dayjs(dateAt).format('lll')}</p>
            </div>
        );
    }

    return (
        <div className="col-span-1 row-start-1 md:row-start-auto flex flex-col sm:flex-row md:flex-col gap-4">
            <div className="max-w-sm w-full shadow-sm rounded-lg border border-gray-200 overflow-hidden text-sm">
                <div className="bg-gray-50 p-4 text-gray-700">
                    <div className="text-xl font-bold text-gray-800">{branch}</div>
                    <div>{`${repo} / ${build}`}</div>
                    {totalCases > 0 && (
                        <div className={`flex text-${color} font-bold text-sm space-x-2`}>
                            <DocumentReportIcon />
                            <p>{`${passingRate}% passed`}</p>
                        </div>
                    )}
                    {!startAt && (
                        <>
                            <div className="flex space-x-2">
                                <ClockIcon />
                                {isWithinTimeDuration(end, {
                                    m: 10,
                                }) ? (
                                    <span className={'text-gray-600'}>{'on queue'}</span>
                                ) : (
                                    <span className={'text-red-400'}>{'timed out'}</span>
                                )}
                            </div>
                            <div className="flex space-x-2">
                                <CalendarIcon />
                                <p>{formatDate(createAt)}</p>
                            </div>
                        </>
                    )}
                    {startAt && (
                        <div className="flex space-x-2">
                            <ClockIcon />
                            <TimeElapse
                                start={startAt}
                                lastUpdate={end}
                                isDone={state === stateDone}
                            />
                        </div>
                    )}
                    {formattedStartDate && (
                        <div className="flex space-x-2">
                            <CalendarIcon />
                            <p>{formattedStartDate}</p>
                        </div>
                    )}
                    <Divider />
                    <div
                        className={`flex space-x-2 cursor-pointer hover:bg-gray-200 ${
                            !selectedSpecGroup ? 'text-gray-700' : 'text-gray-300'
                        }`}
                        onClick={setSelectedGroup}
                    >
                        <DocumentIcon />
                        <p>{`${specs_registered} specs`}</p>
                    </div>
                    {specsGroup && specsGroup.passed > 0 && (
                        <div
                            className={`flex space-x-2 cursor-pointer hover:bg-gray-200 ${
                                !selectedSpecGroup || selectedSpecGroup === 'passed'
                                    ? 'text-green-600'
                                    : 'text-gray-300'
                            }`}
                            data-group="passed"
                            onClick={setSelectedGroup}
                        >
                            <ClipboardCheckIcon />
                            <p>{`${specsGroup.passed} passed`}</p>
                        </div>
                    )}
                    {specsGroup && specsGroup.failed > 0 && (
                        <div
                            className={`flex space-x-2 cursor-pointer hover:bg-gray-200 ${
                                !selectedSpecGroup || selectedSpecGroup === 'failed'
                                    ? 'text-red-400'
                                    : 'text-gray-300'
                            }`}
                            data-group="failed"
                            onClick={setSelectedGroup}
                        >
                            <ClipboardListIcon />
                            <p>{`${specsGroup.failed} failed`}</p>
                        </div>
                    )}
                    {specsGroup && specsGroup.known_fail > 0 && (
                        <div
                            className={`flex space-x-2 cursor-pointer hover:bg-gray-200 ${
                                !selectedSpecGroup || selectedSpecGroup === 'known_fail'
                                    ? 'text-amber-700'
                                    : 'text-gray-300'
                            }`}
                            data-group="known_fail"
                            onClick={setSelectedGroup}
                        >
                            <ClipboardListIcon />

                            <p>{`${specsGroup.known_fail} known`}</p>
                        </div>
                    )}
                    {specsGroup && specsGroup.started > 0 && (
                        <div
                            className={`flex space-x-2 cursor-pointer hover:bg-gray-200 ${
                                !selectedSpecGroup || selectedSpecGroup === stateStarted
                                    ? 'text-blue-400'
                                    : 'text-gray-300'
                            }`}
                            data-group="started"
                            onClick={setSelectedGroup}
                        >
                            <Spinner />
                            <p>{`${specsGroup.started} processing`}</p>
                        </div>
                    )}
                    {specsGroup && specsGroup.timed_out > 0 && (
                        <div
                            className={`flex space-x-2 cursor-pointer hover:bg-gray-200 ${
                                !selectedSpecGroup || selectedSpecGroup === stateTimedOut
                                    ? 'text-red-400'
                                    : 'text-gray-300'
                            }`}
                            data-group="timed_out"
                            onClick={setSelectedGroup}
                        >
                            <ClipboardIcon />
                            <p>{`${specsGroup.timed_out} timed out`}</p>
                        </div>
                    )}
                    {specsGroup && specsGroup.on_queue > 0 && (
                        <div
                            className={`flex space-x-2 cursor-pointer hover:bg-gray-200 ${
                                !selectedSpecGroup || selectedSpecGroup === stateOnQueue
                                    ? 'text-gray-500'
                                    : 'text-gray-300'
                            }`}
                            data-group="on_queue"
                            onClick={setSelectedGroup}
                        >
                            <ClipboardIcon />
                            <p>{`${specsGroup.on_queue} on queue`}</p>
                        </div>
                    )}
                    <Divider />
                    <div
                        className={`flex space-x-2 cursor-pointer hover:bg-gray-200 ${
                            !selectedCaseState ? 'text-gray-700' : 'text-gray-300'
                        }`}
                        onClick={setSelectedState}
                    >
                        <DocumentTextIcon />
                        <p>{`${totalCases} tests`}</p>
                    </div>
                    {totalCases > 0 && (
                        <div
                            className={`flex space-x-2 cursor-pointer hover:bg-gray-200 ${
                                !selectedCaseState || selectedCaseState === 'pass'
                                    ? 'text-green-600'
                                    : 'text-gray-300'
                            }`}
                            data-state="pass"
                            onClick={setSelectedState}
                        >
                            <CheckCircleIcon />
                            <p>{`${pass} passed`}</p>
                        </div>
                    )}
                    {fail > 0 && (
                        <div
                            className={`flex space-x-2 cursor-pointer hover:bg-gray-200 ${
                                !selectedCaseState || selectedCaseState === 'fail'
                                    ? 'text-red-400'
                                    : 'text-gray-300'
                            }`}
                            data-state="fail"
                            onClick={setSelectedState}
                        >
                            <XCircleIcon />
                            <p>{`${fail} failed`}</p>
                        </div>
                    )}
                    {known_fail > 0 && (
                        <div
                            className={`flex space-x-2 cursor-pointer hover:bg-gray-200 ${
                                !selectedCaseState || selectedCaseState === 'known_fail'
                                    ? 'text-amber-700'
                                    : 'text-gray-300'
                            }`}
                            data-state="known_fail"
                            onClick={setSelectedState}
                        >
                            <XCircleIcon />
                            <p>{`${known_fail} known`}</p>
                        </div>
                    )}
                    {skipped > 0 && (
                        <div
                            className={`flex space-x-2 cursor-pointer hover:bg-gray-200 ${
                                !selectedCaseState || selectedCaseState === 'skipped'
                                    ? 'text-purple-700'
                                    : 'text-gray-300'
                            }`}
                            data-state="skipped"
                            onClick={setSelectedState}
                        >
                            <FastForwardIcon />
                            <p>{`${skipped} skipped`}</p>
                        </div>
                    )}
                    {pending > 0 && (
                        <div
                            className={`flex space-x-2 cursor-pointer hover:bg-gray-200 ${
                                !selectedCaseState || selectedCaseState === 'pending'
                                    ? 'text-blue-700'
                                    : 'text-gray-300'
                            }`}
                            data-state="pending"
                            onClick={setSelectedState}
                        >
                            <ExclamationCircleIcon />
                            <p>{`${pending} pending`}</p>
                        </div>
                    )}
                    {(cypress_version || browser_version || node_version || os_version) && (
                        <>
                            <Divider />
                            {cypress_version && <p>{`cypress@${cypress_version}`}</p>}
                            {browser_version && <p>{`${browser_name}@${browser_version}`}</p>}
                            {node_version && <p>{`node@${node_version}`}</p>}
                            {os_version && <p>{`${os_name}@${os_version}`}</p>}
                        </>
                    )}
                    {(createAt || startAt || endAt || updateAt) && (
                        <>
                            <Divider />
                            {createAt && renderDate('created', createAt)}
                            {startAt && renderDate('started', startAt)}
                            {endAt && renderDate('ended', endAt)}
                            {updateAt &&
                                updateAt !== createAt &&
                                updateAt !== endAt &&
                                renderDate('updated', updateAt)}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CycleDetail;
