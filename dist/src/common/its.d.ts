/**
 * 주어진 구성(config)과 명령어 인자(args)를 사용하여 ITS 수신자 주소를 인코딩합니다.
 * @param config - 애플리케이션 구성 객체.
 * @param args - 명령어 인자 배열. 예: ['destination-chain', 'destination-address'].
 * @param _options - 명령어 옵션 객체.
 */
declare function encodeRecipient(config: any, args: string[], _options: any): Promise<void>;
/**
 * 주어진 프로세서(processor)를 사용하여 명령어 인자(args)와 옵션(options)을 처리합니다.
 * @param processor - 실행할 프로세서 함수. 예: encodeRecipient.
 * @param args - 명령어 인자 배열.
 * @param options - 명령어 옵션 객체.
 */
declare function mainProcessor(processor: (config: any, args: string[], options: any) => Promise<void>, args: string[], options: any): Promise<void>;
export { encodeRecipient, mainProcessor };
