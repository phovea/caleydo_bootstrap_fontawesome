import { ILayoutContainer, ILayoutDump, IRootLayoutContainer, IView, IBuilder, IBuildAbleOrViewLike } from './interfaces';
import { EOrientation } from './interfaces';
import { IViewLayoutContainerOptions } from './internal/ViewLayoutContainer';
import { SplitLayoutContainer } from './internal/SplitLayoutContainer';
import { LineUpLayoutContainer } from './internal/LineUpLayoutContainer';
import { TabbingLayoutContainer, ITabbingLayoutContainerOptions } from './internal/TabbingLayoutContainer';
import { RootLayoutContainer } from './internal/RootLayoutContainer';
import { ILayoutContainerOption } from './internal/ALayoutContainer';
import { ISequentialLayoutContainerOptions } from './internal/ASequentialLayoutContainer';
export declare abstract class ABuilder implements IBuilder {
    protected _name: string;
    protected _fixed: boolean;
    protected _autoWrap: boolean | string;
    protected _fixedLayout: boolean;
    /**
     * specify the name of the view
     * @param {string} name the new name
     * @return {this} itself
     */
    name(name: string): this;
    /**
     * specify that the view cannot be closed and the view and separators cannot be moved via drag and drop
     * setting the fixed option implies the fixedLayout option
     * @return {this} itself
     */
    fixed(): this;
    /**
     * specify that drag and drop is disabled for views, but the separator can still be moved
     * @returns {this}
     */
    fixedLayout(): this;
    /**
     * specify that the view should be automatically wrapped with a tabbing container in case of a new split
     * @return {this} itself
     */
    autoWrap(name?: string): this;
    protected buildOptions(): Partial<ILayoutContainerOption>;
    abstract build(root: RootLayoutContainer, doc: Document): ILayoutContainer;
}
export declare class ViewBuilder extends ABuilder {
    private readonly view;
    private _hideHeader;
    constructor(view: string | IView | HTMLElement);
    hideHeader(): this;
    protected buildOptions(): Partial<IViewLayoutContainerOptions>;
    build(root: RootLayoutContainer, doc: Document): ILayoutContainer;
}
export declare class LayoutUtils {
    /**
     * restores the given layout dump
     * @param {ILayoutDump} dump the dump
     * @param {(referenceId: number) => IView} restoreView lookup function for getting the underlying view given the dumped reference id
     * @param {Document} doc root document
     * @return {ILayoutContainer} the root element
     */
    static restore(dump: ILayoutDump, restoreView: (referenceId: number) => IView, doc?: Document): ILayoutContainer;
    /**
     * derives from an existing html scaffolded layout the phovea layout and replaced the nodes with it
     * @param {HTMLElement} node the root node
     * @param {(node: HTMLElement) => IView} viewFactory how to build a view from a node
     */
    static derive(node: HTMLElement, viewFactory?: (node: HTMLElement) => IView): IRootLayoutContainer;
    static toBuilder(view: IBuildAbleOrViewLike): ABuilder;
}
export declare abstract class AParentBuilder extends ABuilder {
    protected readonly children: ABuilder[];
    constructor(children: IBuildAbleOrViewLike[]);
    protected push(view: IBuildAbleOrViewLike): this;
    protected buildChildren(root: RootLayoutContainer, doc: Document): ILayoutContainer[];
}
export declare class SplitBuilder extends AParentBuilder {
    private readonly orientation;
    private _ratio;
    constructor(orientation: EOrientation, ratio: number, left: IBuildAbleOrViewLike, right: IBuildAbleOrViewLike);
    /**
     * set the ratio between the left and right view
     * @param {number} ratio the new ratio
     * @return {SplitBuilder} itself
     */
    ratio(ratio: number): this;
    protected buildOptions(): Partial<ISequentialLayoutContainerOptions>;
    build(root: RootLayoutContainer, doc?: Document): SplitLayoutContainer;
}
declare class LineUpBuilder extends AParentBuilder {
    private readonly orientation;
    private readonly stackLayout;
    constructor(orientation: EOrientation, children: IBuildAbleOrViewLike[], stackLayout?: boolean);
    /**
     * push another child
     * @param {IBuildAbleOrViewLike} view the view to add
     * @return {LineUpBuilder} itself
     */
    push(view: IBuildAbleOrViewLike): this;
    protected buildOptions(): Partial<ISequentialLayoutContainerOptions>;
    build(root: RootLayoutContainer, doc?: Document): LineUpLayoutContainer;
}
declare class TabbingBuilder extends AParentBuilder {
    private _active;
    /**
     * push another tab
     * @param {IBuildAbleOrViewLike} view the tab
     * @return {TabbingBuilder} itself
     */
    push(view: IBuildAbleOrViewLike): this;
    /**
     * adds another child and specify it should be the active one
     * @param {IBuildAbleOrViewLike} view the active tab
     * @return {AParentBuilder} itself
     */
    active(view: IBuildAbleOrViewLike): this;
    protected buildOptions(): Partial<ITabbingLayoutContainerOptions>;
    build(root: RootLayoutContainer, doc: any): TabbingLayoutContainer;
}
export declare class BuilderUtils {
    /**
     * builder for creating a view
     * @param {string | IView} view possible view content
     * @return {ViewBuilder} a view builder
     */
    static view(view: string | IView | HTMLElement): ViewBuilder;
    /**
     * creates the root of a new layout
     * @param {IBuildAbleOrViewLike} child the only child of the root
     * @param {Document} doc root Document
     * @return {IRootLayoutContainer} the root element
     */
    static root(child: IBuildAbleOrViewLike, doc?: Document): IRootLayoutContainer;
    /**
     * builder for creating a horizontal split layout (moveable splitter)
     * @param {number} ratio ratio between the two given elements
     * @param {IBuildAbleOrViewLike} left left container
     * @param {IBuildAbleOrViewLike} right right container
     * @return {SplitBuilder} a split builder
     */
    static horizontalSplit(ratio: number, left: IBuildAbleOrViewLike, right: IBuildAbleOrViewLike): SplitBuilder;
    /**
     * builder for creating a vertical split layout (moveable splitter)
     * @param {number} ratio ratio between the two given elements
     * @param {IBuildAbleOrViewLike} left left container
     * @param {IBuildAbleOrViewLike} right right container
     * @return {SplitBuilder} a split builder
     */
    static verticalSplit(ratio: number, left: IBuildAbleOrViewLike, right: IBuildAbleOrViewLike): SplitBuilder;
    /**
     * builder for creating a horizontal lineup layout (each container has the same full size with scrollbars)
     * @param {IBuildAbleOrViewLike} children the children of the layout
     * @return {LineUpBuilder} a lineup builder
     */
    static horizontalLineUp(...children: IBuildAbleOrViewLike[]): LineUpBuilder;
    /**
     * builder for creating a vertical lineup layout (each container has the same full size with scrollbars)
     * @param {IBuildAbleOrViewLike} children the children of the layout
     * @return {LineUpBuilder} a lineup builder
     */
    static verticalLineUp(...children: IBuildAbleOrViewLike[]): LineUpBuilder;
    /**
     * similar to the horizontalLineUp, except that each container takes its own amount of space
     * @param {IBuildAbleOrViewLike} children the children of the layout
     * @return {LineUpBuilder} a lineup builder
     */
    static horizontalStackedLineUp(...children: IBuildAbleOrViewLike[]): LineUpBuilder;
    /**
     * similar to the verticalLineUp, except that each container takes its own amount of space
     * @param {IBuildAbleOrViewLike} children the children of the layout
     * @return {LineUpBuilder} a lineup builder
     */
    static verticalStackedLineUp(...children: IBuildAbleOrViewLike[]): LineUpBuilder;
    /**
     * builder for creating a tab layout
     * @param {IBuildAbleOrViewLike} children the children of the layout
     * @return {TabbingBuilder} a tabbing builder
     */
    static tabbing(...children: IBuildAbleOrViewLike[]): TabbingBuilder;
}
export {};
