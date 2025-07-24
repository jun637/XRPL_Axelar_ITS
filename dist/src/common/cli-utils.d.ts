import 'dotenv/config';
import { Command } from 'commander';
type ProgramType = Command & {
    commands: readonly Command[];
};
type OptionMethod = (program: ProgramType, options?: any) => void;
type AddBaseOptions = {
    ignoreChainNames?: boolean;
    ignorePrivateKey?: boolean;
    address?: string;
};
/**
 * 환경 변수 옵션을 추가합니다.
 * @param program - 명령어 프로그램 객체
 * @param defaultValue - 기본값 (선택 사항)
 */
declare const addEnvOption: (program: ProgramType, defaultValue?: string) => void;
/**
 * 기본 옵션을 추가합니다.
 * @param program - 명령어 프로그램 객체
 * @param options - 옵션 설정 (선택 사항)
 * @returns 프로그램 객체
 */
declare const addBaseOptions: (program: ProgramType, options?: AddBaseOptions) => ProgramType;
/**
 * 명령어 프로그램에 옵션을 추가합니다.
 * @param program - 명령어 프로그램 객체
 * @param optionMethod - 옵션을 추가할 함수
 * @param options - 옵션 설정 (선택 사항)
 */
declare const addOptionsToCommands: (program: ProgramType, optionMethod: OptionMethod, options?: any) => void;
/**
 * 스토어 옵션을 추가합니다.
 * @param program - 명령어 프로그램 객체
 */
declare const addStoreOptions: (program: ProgramType) => void;
export { addEnvOption, addBaseOptions, addOptionsToCommands, addStoreOptions };
