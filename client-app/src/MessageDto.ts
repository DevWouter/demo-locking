export interface MessageDto {
    time: Date;
    type: 'msg' | 'warning';
    text: string;
    code?: string;
}