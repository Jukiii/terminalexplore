export namespace explorer {
	
	export class FileInfo {
	    Name: string;
	    Path: string;
	    Size: number;
	    ModTime: string;
	    IsDir: boolean;
	    IsHidden: boolean;
	    Extension: string;
	
	    static createFrom(source: any = {}) {
	        return new FileInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Name = source["Name"];
	        this.Path = source["Path"];
	        this.Size = source["Size"];
	        this.ModTime = source["ModTime"];
	        this.IsDir = source["IsDir"];
	        this.IsHidden = source["IsHidden"];
	        this.Extension = source["Extension"];
	    }
	}
	export class TreeNode {
	    Name: string;
	    Path: string;
	    Size: number;
	    ModTime: string;
	    IsDir: boolean;
	    IsHidden: boolean;
	    Extension: string;
	    Children: TreeNode[];
	    IsExpanded: boolean;
	    IsLoaded: boolean;
	    Parent?: TreeNode;
	    Level: number;
	
	    static createFrom(source: any = {}) {
	        return new TreeNode(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Name = source["Name"];
	        this.Path = source["Path"];
	        this.Size = source["Size"];
	        this.ModTime = source["ModTime"];
	        this.IsDir = source["IsDir"];
	        this.IsHidden = source["IsHidden"];
	        this.Extension = source["Extension"];
	        this.Children = this.convertValues(source["Children"], TreeNode);
	        this.IsExpanded = source["IsExpanded"];
	        this.IsLoaded = source["IsLoaded"];
	        this.Parent = this.convertValues(source["Parent"], TreeNode);
	        this.Level = source["Level"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

