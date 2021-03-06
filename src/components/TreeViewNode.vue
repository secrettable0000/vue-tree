<template>
  <!--
      A Component meant to be used internally by the TreeView component. See the documentation
      for a description of the expected data format.
  -->
  <li :id="nodeId"
      class="tree-view-node"
      :class="[customClasses.treeViewNode,
               model.treeNodeSpec._.dragging ? 'tree-view-node-dragging' : '']"
      role="treeitem"
      :tabindex="ariaTabIndex"
      :aria-expanded="ariaExpanded"
      :aria-selected="ariaSelected"
      @keydown="$_treeViewNodeAria_onKeyDown">

    <div class="tree-view-node-self"
         :class="[customClasses.treeViewNodeSelf,
                  isEffectivelySelected ? 'tree-view-node-self-selected' : '',
                  isEffectivelySelected ? customClasses.treeViewNodeSelfSelected : '',
                  model.treeNodeSpec._.isDropTarget ? 'tree-view-node-self-drop-target': '',
                  model.treeNodeSpec._.isChildDropTarget ? 'tree-view-node-self-child-drop-target': '']"
         :draggable="model.treeNodeSpec.draggable"
         :dragging="model.treeNodeSpec._.dragging"
         @click="$_treeViewNode_onClick"
         @dblclick="$_treeViewNode_onDblclick"
         @dragend="$_treeViewNodeDnd_onDragend"
         @dragenter="$_treeViewNodeDnd_onDragenter"
         @dragleave="$_treeViewNodeDnd_onDragleave"
         @dragover="$_treeViewNodeDnd_onDragover"
         @dragstart="$_treeViewNodeDnd_onDragstart"
         @drop="$_treeViewNodeDnd_onDrop">

      <!-- Top Drop Target -->
      <div class="tree-view-node-self-sibling-drop-target tree-view-node-self-prev-target"
           :class="[model.treeNodeSpec._.isPrevDropTarget ? 'tree-view-node-self-sibling-drop-target-hover': '']"></div>

      <!-- Expander -->
      <button :id="expanderId"
              type="button"
              v-if="canExpand"
              aria-hidden="true"
              tabindex="-1"
              :title="model.treeNodeSpec.expanderTitle"
              class="tree-view-node-self-expander"
              :class="[customClasses.treeViewNodeSelfExpander,
                       model.treeNodeSpec.state.expanded ? 'tree-view-node-self-expanded' : '',
                       model.treeNodeSpec.state.expanded ? customClasses.treeViewNodeSelfExpanded : '']"
              @click="$_treeViewNode_onExpandedChange">
              <i class="tree-view-node-self-expanded-indicator"
                 :class="customClasses.treeViewNodeSelfExpandedIndicator"></i></button>
      <span v-else
            class="tree-view-node-self-spacer"
            :class="customClasses.treeViewNodeSelfSpacer"></span>

      <!-- Inputs and labels -->
      <!-- Checkbox -->
      <slot v-if="model.treeNodeSpec.input && model.treeNodeSpec.input.type === 'checkbox'"
            name="checkbox"
            :model="model"
            :customClasses="customClasses"
            :inputId="inputId"
            :checkboxChangeHandler="$_treeViewNode_onCheckboxChange">

        <label :for="inputId"
               :title="model.treeNodeSpec.title"
               class="tree-view-node-self-label"
               :class="customClasses.treeViewNodeSelfLabel">

          <input :id="inputId"
                 tabindex="-1"
                 class="tree-view-node-self-input tree-view-node-self-checkbox"
                 :class="[customClasses.treeViewNodeSelfInput, customClasses.treeViewNodeSelfCheckbox]"
                 type="checkbox"
                 :disabled="model.treeNodeSpec.state.input.disabled"
                 v-model="model.treeNodeSpec.state.input.value"
                 @change="$_treeViewNode_onCheckboxChange" />

          {{ label }}
        </label>
      </slot>

      <!-- Radiobutton -->
      <slot v-else-if="model.treeNodeSpec.input && model.treeNodeSpec.input.type === 'radio'"
            name="radio"
            :model="model"
            :customClasses="customClasses"
            :inputId="inputId"
            :inputModel="radioGroupValues[model.treeNodeSpec.input.name]"
            :radioChangeHandler="$_treeViewNode_onRadioChange">

        <label :for="inputId"
               :title="model.treeNodeSpec.title"
               class="tree-view-node-self-label"
               :class="customClasses.treeViewNodeSelfLabel">

          <input :id="inputId"
                 tabindex="-1"
                 class="tree-view-node-self-input tree-view-node-self-radio"
                 :class="[customClasses.treeViewNodeSelfInput, customClasses.treeViewNodeSelfRadio]"
                 type="radio"
                 :name="model.treeNodeSpec.input.name"
                 :value="model.treeNodeSpec.input.value"
                 :disabled="model.treeNodeSpec.state.input.disabled"
                 v-model="radioGroupValues[model.treeNodeSpec.input.name]"
                 @change="$_treeViewNode_onRadioChange" />

          {{ label }}
        </label>
      </slot>

      <!-- Text (if not an input) -->
      <slot v-else
            name="text"
            :model="model"
            :customClasses="customClasses">

        <span :title="model.treeNodeSpec.title"
              class="tree-view-node-self-text"
              :class="customClasses.treeViewNodeSelfText">
          {{ label }}
        </span>
      </slot>

      <!-- Add Child button -->
      <button :id="addChildId"
              type="button"
              v-if="model.treeNodeSpec.addChildCallback"
              aria-hidden="true"
              tabindex="-1"
              :title="model.treeNodeSpec.addChildTitle"
              class="tree-view-node-self-action"
              :class="[customClasses.treeViewNodeSelfAction, customClasses.treeViewNodeSelfAddChild]"
              @click="$_treeViewNode_onAddChild">
        <i class="tree-view-node-self-add-child-icon"
            :class="customClasses.treeViewNodeSelfAddChildIcon"></i>
      </button>

      <!-- Delete button -->
      <button :id="deleteId"
              type="button"
              v-if="model.treeNodeSpec.deletable"
              aria-hidden="true"
              tabindex="-1"
              :title="model.treeNodeSpec.deleteTitle"
              class="tree-view-node-self-action"
              :class="[customClasses.treeViewNodeSelfAction, customClasses.treeViewNodeSelfDelete]"
              @click="$_treeViewNode_onDelete">
        <i class="tree-view-node-self-delete-icon"
            :class="customClasses.treeViewNodeSelfDeleteIcon"></i>
      </button>

      <!-- Bottom Drop Target -->
      <div class="tree-view-node-self-sibling-drop-target tree-view-node-self-next-target"
           :class="[model.treeNodeSpec._.isNextDropTarget ? 'tree-view-node-self-sibling-drop-target-hover': '']"></div>
    </div>

    <!-- Children and Loading Placholder -->
    <slot v-if="model.treeNodeSpec.state.expanded && canExpand && !areChildrenLoaded"
          name="loading"
          :model="model"
          :customClasses="customClasses">

      <span class="tree-view-node-loading"
            :class="customClasses.treeViewNodeLoading">
        ...
      </span>
    </slot>
    <ul v-show="model.treeNodeSpec.state.expanded"
        v-if="canExpand && areChildrenLoaded"
        class="tree-view-node-children"
        :class="customClasses.treeViewNodeChildren"
        role="group"
        :aria-hidden="(!model.treeNodeSpec.state.expanded).toString()">
      <TreeViewNode v-for="nodeModel in children"
                    :key="nodeModel[nodeModel.treeNodeSpec && nodeModel.treeNodeSpec.idProperty ? nodeModel.treeNodeSpec.idProperty : 'id']"
                    :depth="depth + 1"
                    :initial-model="nodeModel"
                    :model-defaults="modelDefaults"
                    :parent-id="id"
                    :selection-mode="selectionMode"
                    :tree-id="treeId"
                    :initial-radio-group-values="radioGroupValues"
                    :aria-key-map="ariaKeyMap"
                    :is-mounted="isMounted"
                    @treeViewNodeClick="(t, e)=>$emit(TvEvent.Click, t, e)"
                    @treeViewNodeDblclick="(t, e)=>$emit(TvEvent.DoubleClick, t, e)"
                    @treeViewNodeCheckboxChange="(t, e)=>$emit(TvEvent.CheckboxChange, t, e)"
                    @treeViewNodeRadioChange="(t, e)=>$emit(TvEvent.RadioChange, t, e)"
                    @treeViewNodeExpandedChange="(t, e)=>$emit(TvEvent.ExpandedChange, t, e)"
                    @treeViewNodeChildrenLoaded="(t, e)=>$emit(TvEvent.ChildrenLoad, t, e)"
                    @treeViewNodeSelectedChange="(t, e)=>$emit(TvEvent.SelectedChange, t, e)"
                    @treeViewNodeAdd="(t, p, e)=>$emit(TvEvent.Add, t, p, e)"
                    @treeViewNodeDelete="$_treeViewNode_handleChildDeletion"
                    @treeViewNodeAriaFocusable="(t)=>$emit(TvEvent.FocusableChange, t)"
                    @treeViewNodeAriaRequestParentFocus="$_treeViewNodeAria_focus"
                    @treeViewNodeAriaRequestFirstFocus="()=>$emit(TvEvent.RequestFirstFocus)"
                    @treeViewNodeAriaRequestLastFocus="()=>$emit(TvEvent.RequestLastFocus)"
                    @treeViewNodeAriaRequestPreviousFocus="$_treeViewNodeAria_handlePreviousFocus"
                    @treeViewNodeAriaRequestNextFocus="$_treeViewNodeAria_handleNextFocus"
                    @treeViewNodeDragMove="$_treeViewNodeDnd_dragMoveChild"
                    @treeViewNodeDrop="$_treeViewNodeDnd_drop">
        <template #checkbox="{ model, customClasses, inputId, checkboxChangeHandler }">
          <slot name="checkbox" :model="model" :customClasses="customClasses" :inputId="inputId" :checkboxChangeHandler="checkboxChangeHandler"></slot>
        </template>
        <template #radio="{ model, customClasses, inputId, inputModel, radioChangeHandler }">
          <slot name="radio" :model="model" :customClasses="customClasses" :inputId="inputId" :inputModel="inputModel" :radioChangeHandler="radioChangeHandler"></slot>
        </template>
        <template #text="{ model, customClasses }">
          <slot name="text" :model="model" :customClasses="customClasses"></slot>
        </template>
        <template #loading="{ model, customClasses }">
          <slot name="loading" :model="model" :customClasses="customClasses"></slot>
        </template>
      </TreeViewNode>
    </ul>
  </li>
</template>

<script>
  import TreeViewNodeAria from '../mixins/TreeViewNodeAria';
  import TreeViewNodeDragAndDrop from '../mixins/TreeViewNodeDragAndDrop';
  import SelectionMode from '../enums/selectionMode';
  import InputType from '../enums/inputType';
  import MimeType from '../enums/mimeType';
  import TvEvent from '../enums/event';
  import { isProbablyObject } from '../objectMethods';

  export default {
    name: 'TreeViewNode',
    mixins: [
      TreeViewNodeAria,
      TreeViewNodeDragAndDrop
    ],
    props: {
      depth: {
        type: Number,
        required: true
      },
      initialModel: {
        type: Object,
        required: true
      },
      isMounted: {
        type: Boolean,
        required: true
      },
      modelDefaults: {
        type: Object,
        required: true
      },
      initialRadioGroupValues: {
        type: Object,
        required: true
      },
      selectionMode: {
        type: String,
        required: false,
        default: SelectionMode.None,
        validator: function (value) {
          return Object.values(SelectionMode).includes(value);
        }
      },
      treeId: {
        type: String,
        required: true
      }
    },
    data() {
      return {
        elementsThatIgnoreClicks: 'input, .tree-view-node-self-expander, .tree-view-node-self-expander *, .tree-view-node-self-action, .tree-view-node-self-action *',
        model: this.initialModel,
        radioGroupValues: this.initialRadioGroupValues
      }
    },
    computed: {
      addChildId() {
        return `${this.nodeId}-add-child`;
      },
      areChildrenLoaded() {
        const tns = this.model.treeNodeSpec;
        return typeof tns.loadChildrenAsync !== 'function' || tns.state.areChildrenLoaded;
      },
      ariaExpanded() {
        return this.canExpand ? this.model.treeNodeSpec.state.expanded.toString() : false;
      },
      ariaSelected() {
        // If selection isn't allowed, don't add an aria-selected attribute.
        // If the tree contains nodes that are not selectable, those nodes do not have the aria-selected state.
        if (this.selectionMode === SelectionMode.None || !this.model.treeNodeSpec.selectable) {
          return false;
        }

        // https://www.w3.org/TR/wai-aria-practices-1.1/#tree_roles_states_props
        // If the tree does not support multiple selection, aria-selected is set to true
        // for the selected node and it is not present on any other node in the tree.
        if (this.selectionMode !== SelectionMode.Multiple) {
          return this.model.treeNodeSpec.state.selected ? 'true' : false;
        }

        // If the tree supports multiple selection:
        //   All selected nodes have aria-selected set to true.
        //   All nodes that are selectable but not selected have aria-selected set to false.
        return this.model.treeNodeSpec.state.selected.toString();
      },
      canExpand() {
        // A node can be expanded if it is expandable and either has children or has not
        // yet had the asynchronous loader for children called.
        return (this.children.length > 0 || !this.areChildrenLoaded) && this.model.treeNodeSpec.expandable;
      },
      children() {
        return this.model[this.childrenPropName];
      },
      childrenPropName() {
        return this.model.treeNodeSpec.childrenProperty || 'children';
      },
      customClasses() {
        return (this.model.treeNodeSpec.customizations || {}).classes || {};
      },
      deleteId() {
        return `${this.nodeId}-delete`;
      },
      expanderId() {
        return `${this.nodeId}-exp`;
      },
      id() {
        return this.model[this.idPropName];
      },
      idPropName() {
        return this.model.treeNodeSpec.idProperty || 'id';
      },
      inputId() {
        return `${this.nodeId}-input`;
      },
      isEffectivelySelected() {
        return this.selectionMode !== SelectionMode.None && this.model.treeNodeSpec.selectable && this.model.treeNodeSpec.state.selected;
      },
      label() {
        return this.model[this.labelPropName];
      },
      labelPropName() {
        return this.model.treeNodeSpec.labelProperty || 'label';
      },
      nodeId() {
        return `${this.treeId}-${this.id}`;
      },
      TvEvent() {
        return TvEvent;
      }
    },
    created() {
      this.$_treeViewNode_normalizeNodeData();

      // id and label are required; notify the user. Validation is done here instead
      // of at the prop level due to dependency on multiple props at once and defaulting
      // that takes place in the normalization process
      if (!this.id || (typeof this.id !== 'number' && typeof this.id !== 'string')) {
        console.error(`initialModel id is required and must be a number or string. Expected prop ${this.idPropName} to exist on the model.`);
      }
      if(!this.label || typeof this.label !== 'string') {
        console.error(`initialModel label is required and must be a string. Expected prop ${this.labelPropName} to exist on the model.`);
      }
    },
    watch: {
      'model.treeNodeSpec.state.selected': function(newValue) {
          this.$emit(TvEvent.SelectedChange, this.model);
      }
    },
    methods: {
      /*
       * Normalizes the data model to the format consumable by TreeViewNode.
       */
      $_treeViewNode_normalizeNodeData() {
        // The target model must have a treeNodeSpec property to assign defaults into; if missing,
        // it will be normalized into existence in $_treeViewNodeAria_normalizeNodeData().
        this.$_treeViewNode_assignDefaultProps(this.modelDefaults, this.model.treeNodeSpec);

        // Set expected properties if not provided
        if (typeof this.model.treeNodeSpec.childrenProperty !== 'string') {
          this.$set(this.model.treeNodeSpec, 'childrenProperty', 'children');
        }
        if (typeof this.model.treeNodeSpec.idProperty !== 'string') {
          this.$set(this.model.treeNodeSpec, 'idProperty', 'id');
        }
        if (typeof this.model.treeNodeSpec.labelProperty !== 'string') {
          this.$set(this.model.treeNodeSpec, 'labelProperty', 'label');
        }

        if (!Array.isArray(this.children)) {
          this.$set(this.model, this.childrenPropName, []);
        }
        if (typeof this.model.treeNodeSpec.expandable !== 'boolean') {
          this.$set(this.model.treeNodeSpec, 'expandable', true);
        }
        if (typeof this.model.treeNodeSpec.selectable !== 'boolean') {
          this.$set(this.model.treeNodeSpec, 'selectable', false);
        }
        if (typeof this.model.treeNodeSpec.deletable !== 'boolean') {
          this.$set(this.model.treeNodeSpec, 'deletable', false);
        }
        if (typeof this.model.treeNodeSpec.draggable !== 'boolean') {
          this.$set(this.model.treeNodeSpec, 'draggable', false);
        }
        if (typeof this.model.treeNodeSpec.allowDrop !== 'boolean') {
          this.$set(this.model.treeNodeSpec, 'allowDrop', false);
        }

        if (typeof this.model.treeNodeSpec.addChildCallback !== 'function') {
          this.$set(this.model.treeNodeSpec, 'addChildCallback', null);
        }

        if (typeof this.model.treeNodeSpec.title !== 'string' || this.model.treeNodeSpec.title.trim().length === 0) {
          this.$set(this.model.treeNodeSpec, 'title', null);
        }
        if (typeof this.model.treeNodeSpec.expanderTitle !== 'string' || this.model.treeNodeSpec.expanderTitle.trim().length === 0) {
          this.$set(this.model.treeNodeSpec, 'expanderTitle', null);
        }
        if (typeof this.model.treeNodeSpec.addChildTitle !== 'string' || this.model.treeNodeSpec.addChildTitle.trim().length === 0) {
          this.$set(this.model.treeNodeSpec, 'addChildTitle', null);
        }
        if (typeof this.model.treeNodeSpec.deleteTitle !== 'string' || this.model.treeNodeSpec.deleteTitle.trim().length === 0) {
          this.$set(this.model.treeNodeSpec, 'deleteTitle', null);
        }

        if (this.model.treeNodeSpec.customizations == null || typeof this.model.treeNodeSpec.customizations !== 'object') {
          this.$set(this.model.treeNodeSpec, 'customizations', {});
        }

        if(typeof this.model.treeNodeSpec.loadChildrenAsync !== 'function') {
          this.$set(this.model.treeNodeSpec, 'loadChildrenAsync', null);
        }

        // Internal members
        this.$set(this.model.treeNodeSpec, '_', {});
        this.$set(this.model.treeNodeSpec._, 'dragging', false);

        this.$_treeViewNode_normalizeNodeInputData();
        this.$_treeViewNode_normalizeNodeStateData();
      },
      /**
       * Normalizes the data model's data related to input element generation.
       */
      $_treeViewNode_normalizeNodeInputData() {

        let input = this.model.treeNodeSpec.input;

        // For nodes that are inputs, they must specify at least a type.
        // Only a subset of types are accepted.
        if (input === null || typeof input !== 'object' || !Object.values(InputType).includes(input.type)) {
          this.$set(this.model.treeNodeSpec, 'input', null);
        }
        else {
          if (typeof input.name !== 'string' || input.name.trim().length === 0) {
            this.$set(input, 'name', null);
          }

          if (input.type === InputType.RadioButton) {
            if (typeof input.name !== 'string' || input.name.trim().length === 0) {
              this.$set(input, 'name', 'unspecifiedRadioName');
            }
            if (typeof input.value !== 'string' || input.value.trim().length === 0) {
              this.$set(input, 'value', this.label.replace(/[\s&<>"'\/]/g, ''));
            }
            if (!this.radioGroupValues.hasOwnProperty(input.name)) {
              this.$set(this.radioGroupValues, input.name, '');
            }

            if (input.isInitialRadioGroupValue === true) {
              this.$set(this.radioGroupValues, input.name, input.value);
            }
          }
        }
      },
      /**
       * Normalizes the data model's data related to the node's state.
       */
      $_treeViewNode_normalizeNodeStateData() {
        if (this.model.treeNodeSpec.state === null || typeof this.model.treeNodeSpec.state !== 'object') {
          this.$set(this.model.treeNodeSpec, 'state', {});
        }

        let state = this.model.treeNodeSpec.state;

        // areChildrenLoaded and areChildrenLoading are internal state used with asynchronous child
        // node loading. Any node with asynchronously loaded children starts as not expanded.
        this.$set(state, 'areChildrenLoaded', typeof this.model.treeNodeSpec.loadChildrenAsync !== 'function');
        this.$set(state, 'areChildrenLoading', false);

        if (typeof state.expanded !== 'boolean' || !state.areChildrenLoaded) {
          this.$set(state, 'expanded', false);
        }
        if (typeof state.selected !== 'boolean') {
          this.$set(state, 'selected', false);
        }

        if (this.model.treeNodeSpec.input) {
          if (state.input === null || typeof state.input !== 'object') {
            this.$set(state, 'input', {});
          }

          if (state.input.disabled === null || typeof state.input.disabled !== 'boolean') {
            this.$set(state.input, 'disabled', false);
          }

          if (this.model.treeNodeSpec.input.type === InputType.Checkbox) {

            if (typeof state.input.value !== 'boolean') {
              this.$set(state.input, 'value', false);
            }
          }
        }
      },
      /**
       * Assigns any properties from the source object to the target object
       * where the target object doesn't already define that property.
       * @param {Object} source The source object from which properties are read
       * @param {Object} target The target object into which missing properties are assigned
       */
      $_treeViewNode_assignDefaultProps(source, target) {

        // Make sure the defaults is an object
        if (isProbablyObject(source)) {

          // Use a copy of the source, since the props can be fubar'd by the assigns
          const sourceCopy = JSON.parse(JSON.stringify(source));

          // Assign existing values into the source
          Object.assign(sourceCopy, target);

          for (const propName of Object.keys(source)) {
            // Functions are lost on the JSON copy, so snag the original. Otherwise, use the merged value.
            const propValue = typeof source[propName] === 'function' ? source[propName] : sourceCopy[propName];

            if (isProbablyObject(propValue)) {
              // Find object properties to deep assign them
              this.$set(target, propName, target[propName] || {});
              this.$_treeViewNode_assignDefaultProps(propValue, target[propName]);
            }
            else if (typeof propValue === 'function' && !target[propName]) {
              // Find function properties and assign if missing in target.
              target[propName] = propValue;
            }
            else {
              // Otherwise, copy from the source to the target.
              this.$set(target, propName, propValue);
            }
          }
        }
      },
      /**
       * Pass the event for checkbox changes up from the node.
       * Emits a treeViewNodeCheckboxChange event
       * @param {Event} event The event that triggered the change
       */
      $_treeViewNode_onCheckboxChange(event) {
        this.$emit(TvEvent.CheckboxChange, this.model, event);
      },
      /**
       * Pass the event for radio button changes up from the node.
       * Emits a treeViewNodeRadioChange event
       * @param {Event} event The event that triggered the change
       */
      $_treeViewNode_onRadioChange(event) {
        this.$emit(TvEvent.RadioChange, this.model, event);
      },
      /**
       * Expand the children of this node, starting an asynchronous load if needed.
       * Emits a treeViewNodeExpandedChange event. When children are loaded asynchronously,
       * Emits a treeViewNodeChildrenLoaded event.
       * @param {Event} event The event that triggered the expansion toggle
       */
      async $_treeViewNode_onExpandedChange(event) {
        let spec = this.model.treeNodeSpec;

        // First expand the node (to show either children or a "loading" indicator)
        spec.state.expanded = !spec.state.expanded;
        this.$emit(TvEvent.ExpandedChange, this.model, event);

        // If children need to be loaded asynchronously, load them.
        if (spec.state.expanded && !spec.state.areChildrenLoaded && !spec.state.areChildrenLoading) {

          spec.state.areChildrenLoading = true;
          var childrenResult = await spec.loadChildrenAsync(this.model);

          if (childrenResult) {
            spec.state.areChildrenLoaded = true;
            this.children.splice(0, this.children.length, ...childrenResult);
            this.$emit(TvEvent.ChildrenLoad, this.model, event);
          }

          spec.state.areChildrenLoading = false;
        }
      },
      /**
       * Handle toggling the selected state for this node for Single and Multiple selection modes.
       * Note that for SelectionFollowsFocus mode the selection change is already handled by the
       * "model.treeNodeSpec.focusable" watchermethod in TreeViewNodeAria.
       * @param {Event} event The event that triggered the selection toggle
       */
      $_treeViewNode_toggleSelected(event) {
        if (this.model.treeNodeSpec.selectable && [SelectionMode.Single, SelectionMode.Multiple].includes(this.selectionMode)) {
          this.model.treeNodeSpec.state.selected = !this.model.treeNodeSpec.state.selected;
        }
      },
      /**
       * Handles clicks on the node. It only performs actions if the click happened on an element
       * that does not have node clicks explicitly ingored (e.g., the expander button).
       * Emits a treeViewNodeClick event.
       * @param {Event} event The click event
       */
      $_treeViewNode_onClick(event) {
        // Don't fire this if the target is an element which has its own events
        if (!matches(event.target, this.elementsThatIgnoreClicks)) {
          this.$emit(TvEvent.Click, this.model, event);
          this.$_treeViewNode_toggleSelected(event);
        }

        this.$_treeViewNodeAria_onClick();
      },
      /**
       * Handles double clicks on the node. It only performs actions if the double click happened on an
       * element that does not have node clicks explicitly ingored (e.g., the expander button).
       * Emits a treeViewNodeDblclick event.
       * @param {Event} event The dblclick event
       */
      $_treeViewNode_onDblclick(event) {
        // Don't fire this if the target is an element which has its own events
        if (!matches(event.target, this.elementsThatIgnoreClicks)) {
          this.$emit(TvEvent.DoubleClick, this.model, event);
        }
      },
      /**
       * Add a child node to the end of the child nodes list. The child node data is
       * supplied by an async callback which is the addChildCallback parameter of this node's model.
       * Emits a treeViewNodeAdd if a node is added
       * @param {Event} event The event that triggered the add
       */
      async $_treeViewNode_onAddChild(event) {
        if (this.model.treeNodeSpec.addChildCallback) {
          var childModel = await this.model.treeNodeSpec.addChildCallback(this.model);

          if (childModel) {
            this.children.push(childModel);
            this.$emit(TvEvent.Add, childModel, this.model, event);
          }
        }
      },
      $_treeViewNode_onDelete(event) {
        if (this.model.treeNodeSpec.deletable) {
          this.$emit(TvEvent.Delete, this.model, event);
        }
      },
      /**
       * Removes the given node from the array of children if found.
       * Note that only the node that was deleted fires these, not any subnode, so
       * this comes from a request from the child node for this node to delete it.
       * This emits the treeViewNodeDelete event.
       * @param node {TreeViewNode} The node to remove
       * @param event {Event} The initial event that triggered the deletion
       */
      $_treeViewNode_handleChildDeletion(node, event) {
        // Remove the node from the array of children if this is an immediate child.
        // Note that only the node that was deleted fires these, not any subnode.
        let targetIndex = this.children.indexOf(node);
        if (targetIndex > -1) {
          this.$_treeViewNodeAria_handleChildDeletion(node);
          this.children.splice(targetIndex, 1);
        }

        this.$emit(TvEvent.Delete, node, event);
      }
    },
  };

  /**
   * Returns true if the given element matches the given selector.
   * @param {Element} target The target element to check
   * @param {string} selector The selector to check the target against
   * @returns {Boolean} True if the target element matches the selector, false otherwise.
   */
  function matches(target, selector) {
    if (Element.prototype.matches) {
      return target.matches(selector);
    }
    else if (Element.prototype.msMatchesSelector) {
      return target.msMatchesSelector(selector);
    }
    else if (Element.prototype.webkitMatchesSelector) {
      return target.webkitMatchesSelector(selector);
    }

    return false;
  }

</script>

<style lang="scss">
  $baseHeight: 1.2rem;
  $itemSpacing: 1.2rem;

  // Everything's in a .tree-view (embedded SCSS is the 'default-tree-view-skin' skin)
  .tree-view.default-tree-view-skin {

    // The node, including its content and children list
    .tree-view-node {
      padding-left: 0;

      &:first-child {
        margin-top: 0;
      }

      // ARIA styles
      &[role="treeitem"]:focus {
        outline: 0;

        >.tree-view-node-self {
          outline: black dotted 1px;
        }
      }
    }

    // The node's content, excluding the list of child nodes
    .tree-view-node-self {
      display: flex;
      align-items: flex-start;
      line-height: $baseHeight;
    }

    // Drag and Drop styles
    .tree-view-node-dragging .tree-view-node-self {
      opacity: 0.5;
    }

    .tree-view-node-self-drop-target {
      flex-wrap: wrap;

      &.tree-view-node-self-child-drop-target {
        opacity: .5;
      }

      .tree-view-node-self-sibling-drop-target {
        width: 100%;
        height: 7px;
        background-color: #dddddd;

        &.tree-view-node-self-sibling-drop-target-hover {
          background-color: #bbbbbb;
        }
      }
    }

    // The expander button and indicator content
    .tree-view-node-self-expander {
      padding: 0;
      background: none;
      border: none;
      height: $baseHeight;

      i.tree-view-node-self-expanded-indicator {
        font-style: normal;

        &::before {
          content: '+';
        }
      }

      &.tree-view-node-self-expanded {

        i.tree-view-node-self-expanded-indicator {

          &::before {
            content: '-';
          }
        }
      }
    }

    // The styling for when the node is selected
    .tree-view-node-self-selected {
      background-color: #f0f0f8;
    }

    // Spacing
    .tree-view-node-self-expander,
    .tree-view-node-self-checkbox,
    .tree-view-node-self-radio,
    .tree-view-node-self-spacer,
    .tree-view-node-self-action {
      min-width: 1rem;
    }

    .tree-view-node-self-expander,
    .tree-view-node-self-spacer {
      margin: 0;
    }

    .tree-view-node-self-checkbox,
    .tree-view-node-self-radio {
      margin: 0 0 0 (-$itemSpacing);
    }

    .tree-view-node-self-text,
    .tree-view-node-self-label {
      margin-left: $itemSpacing;
    }

    // Action buttons section
    .tree-view-node-self-action {
      padding: 0;
      background: none;
      border: none;
      height: $baseHeight;
    }

    // Action buttons (add, delete, etc)
    i.tree-view-node-self-add-child-icon {
      font-style: normal;

      &::before {
        content: '+';
      }
    }

    i.tree-view-node-self-delete-icon {
      font-style: normal;

      &::before {
        content: 'x';
      }
    }

    // Loading slot content
    .tree-view-node-loading {
      margin: 0 0 0 (1rem + $itemSpacing);
    }

    // The node's child list
    .tree-view-node-children {
      margin: 0 0 0 (1rem + $itemSpacing);
      padding: 0;
      list-style: none;
    }
  }
</style>
