module powerbi.extensibility.visual {
    export class ColorWheel {
        private map = {};
        private count = 0;
        constructor(private colors: IColorInfo[]) { }

        public getColor(key: string): IColorInfo {
            let value = this.map[key];

            if (value) return value;

            let colors = this.colors;
            value = this.map[key] = colors[this.count++];

            if (this.count >= colors.length) this.count = 0;

            return value;
        }

        public reset(){this.count = 0;}
        public clear(){this.map = {}}
    }
}
