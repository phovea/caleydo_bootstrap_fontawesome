import {ILayoutContainer, ILayoutDump, IRootLayoutContainer, IView, IBuilder, IBuildAbleOrViewLike} from './interfaces';
import {EOrientation} from './interfaces';
import {ViewLayoutContainer, HTMLView, IViewLayoutContainerOptions, NodeView} from './internal/ViewLayoutContainer';
import {SplitLayoutContainer} from './internal/SplitLayoutContainer';
import {LineUpLayoutContainer} from './internal/LineUpLayoutContainer';
import {TabbingLayoutContainer, ITabbingLayoutContainerOptions} from './internal/TabbingLayoutContainer';
import {RootLayoutContainer} from './internal/RootLayoutContainer';
import {ILayoutContainerOption} from './internal/ALayoutContainer';
import {ISequentialLayoutContainerOptions} from './internal/ASequentialLayoutContainer';


export abstract class ABuilder implements IBuilder {
  protected _name: string = 'View';
  protected _fixed: boolean = false;
  protected _autoWrap: boolean | string = false;
  protected _fixedLayout: boolean = false;

  /**
   * specify the name of the view
   * @param {string} name the new name
   * @return {this} itself
   */
  name(name: string): this {
    this._name = name;
    return this;
  }

  /**
   * specify that the view cannot be closed and the view and separators cannot be moved via drag and drop
   * setting the fixed option implies the fixedLayout option
   * @return {this} itself
   */
  fixed(): this {
    this._fixed = true;
    this._fixedLayout = true;
    return this;
  }

  /**
   * specify that drag and drop is disabled for views, but the separator can still be moved
   * @returns {this}
   */
  fixedLayout(): this {
    this._fixedLayout = true;
    return this;
  }

  /**
   * specify that the view should be automatically wrapped with a tabbing container in case of a new split
   * @return {this} itself
   */
  autoWrap(name?: string): this {
    this._autoWrap = name !== undefined ? name : true;
    return this;
  }

  protected buildOptions(): Partial<ILayoutContainerOption> {
    return {
      name: this._name,
      fixed: this._fixed,
      autoWrap: this._autoWrap,
      fixedLayout: this._fixedLayout
    };
  }

  abstract build(root: RootLayoutContainer, doc: Document): ILayoutContainer;
}

export class ViewBuilder extends ABuilder {
  private _hideHeader: boolean = false;

  constructor(private readonly view: string | IView | HTMLElement) {
    super();
  }

  hideHeader() {
    this._hideHeader = true;
    this._fixed = true;
    return this;
  }

  protected buildOptions(): Partial<IViewLayoutContainerOptions> {
    return Object.assign({
      hideHeader: this._hideHeader
    }, super.buildOptions());
  }

  build(root: RootLayoutContainer, doc: Document): ILayoutContainer {
    const options = this.buildOptions();
    if (typeof this.view === 'string') {
      return new ViewLayoutContainer(new HTMLView(this.view, doc), options);
    }
    if ((<HTMLElement>this.view).nodeName !== undefined) {
      return new ViewLayoutContainer(new NodeView(<HTMLElement>this.view), options);
    }
    return new ViewLayoutContainer(<IView>this.view, options);
  }
  /**
   * builder for creating a view
   * @param {string | IView} view possible view content
   * @return {ViewBuilder} a view builder
   */
  static view(view: string | IView | HTMLElement): ViewBuilder {
    return new ViewBuilder(view);
  }
}

function toBuilder(view: IBuildAbleOrViewLike): ABuilder {
  if (view instanceof ABuilder) {
    return view;
  }
  return new ViewBuilder(<IView | string>view);
}

export class LayoutUtils {

  /**
   * restores the given layout dump
   * @param {ILayoutDump} dump the dump
   * @param {(referenceId: number) => IView} restoreView lookup function for getting the underlying view given the dumped reference id
   * @param {Document} doc root document
   * @return {ILayoutContainer} the root element
   */
  static restore(dump: ILayoutDump, restoreView: (referenceId: number) => IView, doc = document): ILayoutContainer {
    const restorer = (d: ILayoutDump) => LayoutUtils.restore(d, restoreView, doc);
    switch (dump.type) {
      case 'root':
        return RootLayoutContainer.restore(dump, doc, (r, child) => toBuilder(child).build(r, doc), (dump, restoreView) => LayoutUtils.restore(dump, restoreView, doc), restoreView);
      case 'split':
        return SplitLayoutContainer.restore(dump, restorer, doc);
      case 'lineup':
        return LineUpLayoutContainer.restore(dump, restorer, doc);
      case 'tabbing':
        return TabbingLayoutContainer.restore(dump, restorer, doc);
      case 'view':
        return ViewLayoutContainer.restore(dump, restoreView, doc);
      default:
        throw new Error(`invalid type: ${dump.type}`);
    }
  }

  /**
   * derives from an existing html scaffolded layout the phovea layout and replaced the nodes with it
   * @param {HTMLElement} node the root node
   * @param {(node: HTMLElement) => IView} viewFactory how to build a view from a node
   */
  static derive(node: HTMLElement, viewFactory: (node: HTMLElement) => IView = (node) => new NodeView(node)): IRootLayoutContainer {
    const doc = node.ownerDocument;
    const r = new RootLayoutContainer(doc, (child) => toBuilder(child).build(r, doc), (dump, restoreView) => LayoutUtils.restore(dump, restoreView, doc));

    const deriveImpl = (node: HTMLElement): ILayoutContainer => {
      switch (node.dataset.layout || 'view') {
        case 'hsplit':
        case 'vsplit':
        case 'split':
          return SplitLayoutContainer.derive(node, deriveImpl);
        case 'lineup':
        case 'vlineup':
        case 'hlineup':
        case 'stack':
        case 'hstack':
        case 'vstack':
          return LineUpLayoutContainer.derive(node, deriveImpl);
        case 'tabbing':
          return TabbingLayoutContainer.derive(node, deriveImpl);
        default:
          // interpret as view
          return ViewLayoutContainer.derive(viewFactory(node) || new NodeView(node));
      }
    };

    r.root = deriveImpl(node);

    if (node.parentElement) {
      //replace old node with new root
      node.parentElement.replaceChild(r.node, node);
    }
    return r;
  }
}

export abstract class AParentBuilder extends ABuilder {
  protected readonly children: ABuilder[] = [];

  constructor(children: IBuildAbleOrViewLike[]) {
    super();
    this._name = 'Container';
    children.forEach((c) => this.push(c));
  }

  protected push(view: IBuildAbleOrViewLike): this {
    this.children.push(toBuilder(view));
    return this;
  }

  protected buildChildren(root: RootLayoutContainer, doc: Document): ILayoutContainer[] {
    return this.children.map((c) => c.build(root, doc));
  }
  /**
   * creates the root of a new layout
   * @param {IBuildAbleOrViewLike} child the only child of the root
   * @param {Document} doc root Document
   * @return {IRootLayoutContainer} the root element
   */
  static root(child: IBuildAbleOrViewLike, doc = document): IRootLayoutContainer {
    const b = toBuilder(child);
    const r = new RootLayoutContainer(doc, (child) => toBuilder(child).build(r, doc), (dump, restoreView) => LayoutUtils.restore(dump, restoreView, doc));
    r.root = b.build(r, doc);
    return r;
  }
}

export class SplitBuilder extends AParentBuilder {
  private _ratio: number = 0.5;

  constructor(private readonly orientation: EOrientation, ratio: number, left: IBuildAbleOrViewLike, right: IBuildAbleOrViewLike) {
    super([left, right]);
    this._ratio = ratio;
  }

  /**
   * set the ratio between the left and right view
   * @param {number} ratio the new ratio
   * @return {SplitBuilder} itself
   */
  ratio(ratio: number) {
    this._ratio = ratio;
    return this;
  }

  protected buildOptions(): Partial<ISequentialLayoutContainerOptions> {
    return Object.assign({
      orientation: this.orientation,
    }, super.buildOptions());
  }

  build(root: RootLayoutContainer, doc = document) {
    const built = this.buildChildren(root, doc);
    console.assert(built.length >= 2);
    const r = new SplitLayoutContainer(doc, this.buildOptions(), this._ratio, built[0], built[1]);
    built.slice(2).forEach((c) => r.push(c));
    return r;
  }

  /**
   * builder for creating a horizontal split layout (moveable splitter)
   * @param {number} ratio ratio between the two given elements
   * @param {IBuildAbleOrViewLike} left left container
   * @param {IBuildAbleOrViewLike} right right container
   * @return {SplitBuilder} a split builder
   */
  static horizontalSplit(ratio: number, left: IBuildAbleOrViewLike, right: IBuildAbleOrViewLike): SplitBuilder {
    return new SplitBuilder(EOrientation.HORIZONTAL, ratio, left, right);
  }

  /**
   * builder for creating a vertical split layout (moveable splitter)
   * @param {number} ratio ratio between the two given elements
   * @param {IBuildAbleOrViewLike} left left container
   * @param {IBuildAbleOrViewLike} right right container
   * @return {SplitBuilder} a split builder
   */
  static verticalSplit(ratio: number, left: IBuildAbleOrViewLike, right: IBuildAbleOrViewLike): SplitBuilder {
    return new SplitBuilder(EOrientation.VERTICAL, ratio, left, right);
  }
}

class LineUpBuilder extends AParentBuilder {

  constructor(private readonly orientation: EOrientation, children: IBuildAbleOrViewLike[], private readonly stackLayout: boolean = false) {
    super(children);
  }

  /**
   * push another child
   * @param {IBuildAbleOrViewLike} view the view to add
   * @return {LineUpBuilder} itself
   */
  push(view: IBuildAbleOrViewLike) {
    return super.push(view);
  }

  protected buildOptions(): Partial<ISequentialLayoutContainerOptions> {
    return Object.assign({
      orientation: this.orientation,
      stackLayout: this.stackLayout
    }, super.buildOptions());
  }

  build(root: RootLayoutContainer, doc = document) {
    const built = this.buildChildren(root, doc);
    return new LineUpLayoutContainer(doc, this.buildOptions(), ...built);
  }

  /**
   * builder for creating a horizontal lineup layout (each container has the same full size with scrollbars)
   * @param {IBuildAbleOrViewLike} children the children of the layout
   * @return {LineUpBuilder} a lineup builder
   */
  static horizontalLineUp(...children: IBuildAbleOrViewLike[]): LineUpBuilder {
    return new LineUpBuilder(EOrientation.HORIZONTAL, children);
  }


  /**
   * builder for creating a vertical lineup layout (each container has the same full size with scrollbars)
   * @param {IBuildAbleOrViewLike} children the children of the layout
   * @return {LineUpBuilder} a lineup builder
   */
  static verticalLineUp(...children: IBuildAbleOrViewLike[]): LineUpBuilder {
    return new LineUpBuilder(EOrientation.VERTICAL, children);
  }

  /**
   * similar to the horizontalLineUp, except that each container takes its own amount of space
   * @param {IBuildAbleOrViewLike} children the children of the layout
   * @return {LineUpBuilder} a lineup builder
   */
  static horizontalStackedLineUp(...children: IBuildAbleOrViewLike[]): LineUpBuilder {
    return new LineUpBuilder(EOrientation.HORIZONTAL, children, true);
  }


  /**
   * similar to the verticalLineUp, except that each container takes its own amount of space
   * @param {IBuildAbleOrViewLike} children the children of the layout
   * @return {LineUpBuilder} a lineup builder
   */
  static verticalStackedLineUp(...children: IBuildAbleOrViewLike[]): LineUpBuilder {
    return new LineUpBuilder(EOrientation.VERTICAL, children, true);
  }
}

class TabbingBuilder extends AParentBuilder {
  private _active: number | null = null;

  /**
   * push another tab
   * @param {IBuildAbleOrViewLike} view the tab
   * @return {TabbingBuilder} itself
   */
  push(view: IBuildAbleOrViewLike) {
    return super.push(view);
  }

  /**
   * adds another child and specify it should be the active one
   * @param {IBuildAbleOrViewLike} view the active tab
   * @return {AParentBuilder} itself
   */
  active(view: IBuildAbleOrViewLike) {
    this._active = this.children.length;
    return super.push(view);
  }

  protected buildOptions(): Partial<ITabbingLayoutContainerOptions> {
    return Object.assign({
      active: this._active
    }, super.buildOptions());
  }

  build(root: RootLayoutContainer, doc) {
    const built = this.buildChildren(root, doc);
    return new TabbingLayoutContainer(doc, this.buildOptions(), ...built);
  }

  /**
   * builder for creating a tab layout
   * @param {IBuildAbleOrViewLike} children the children of the layout
   * @return {TabbingBuilder} a tabbing builder
   */
  static tabbing(...children: IBuildAbleOrViewLike[]): TabbingBuilder {
    return new TabbingBuilder(children);
  }
}
