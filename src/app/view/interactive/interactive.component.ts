import { Component, OnInit, OnDestroy, ViewChild, NgZone ,AfterViewInit,ChangeDetectorRef, HostListener, ViewEncapsulation} from '@angular/core';
import { SharedDataService,isNotNullOrUndefined,isNullOrUndefined } from '../../core/services/sharedData/shared-data.service';
import interact from 'interactjs';
import { jsPlumb } from 'jsplumb';
import { ToastrService } from 'ngx-toastr';
import * as d3 from 'd3';
import { CustomIndexService } from '../../core/services/moduleService/custom-index.service';
import { Subscription } from 'rxjs';
import { CdkDragDrop, moveItemInArray, transferArrayItem, CdkDropList } from '@angular/cdk/drag-drop';
@Component({
  selector: 'app-interactive',
  templateUrl: './interactive.component.html',
  styleUrl: './interactive.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class InteractiveComponent implements OnInit, AfterViewInit, OnDestroy {
  zoomLevel: number = 1;
  isPanning: boolean = false;
  isDragging: boolean = false; // Tracks if a card is being dragged
  isUniverse: boolean = false;
  startX: number = 0;
  startY: number = 0;
  subscriptions = new Subscription();
  deletedId: any = [];
  buttonStyles: any = [];
  canvasPosition = { x: 0, y: 0 };
  showcenterslider: boolean = false;
  draggableCount: number = 0;
  selectedItem: string = 'S&P 500';
  selectedDraggableIds: Set<string> = new Set();
  private defaultOptions: any = {
    PaintStyle: {
      strokeWidth: 1,
      stroke: 'var(--linkColor)',
      pointerEvents: 'none',
    },
    HoverPaintStyle: { strokeWidth: 2, stroke: 'orange' },
    // Connector: ['Bezier', { curviness: 0 }],
    Connector: ['Flowchart', { stub: [5, 10], gap: 10, cornerRadius: 10 }],
    //Connector: ['Flowchart', { stub: 5, gap: 0, cornerRadius: 0, alwaysRespectStubs: true }],
    Endpoint: ['Dot', { radius: 5 }],
    EndpointStyle: { fill: 'var(--linkColor)' },
    Anchors: ['Bottom', 'Top'],
  };
  jsPlumbInstance: any;
  localJson: any = {
    "cards": [
      {
        "sno": 1,
        "id": "universe1",
        "label": "S&P 400",
        "top": 10,
        "type": "universe",
        "assetId": 44444444,
        "data": {
          "name": "S&P 400",
          "assetId": 44444444
        },
        "level": 1,
        "left": 250,
        "child": [
          6,
          3,
          4
        ]
      },
      {
        "sno": 2,
        "id": "universe2",
        "label": "S&P 500",
        "top": 9.99998,
        "type": "universe",
        "assetId": 55555555,
        "data": {
          "name": "S&P 500",
          "assetId": 55555555
        },
        "level": 1,
        "left": 598.4,
        "child": [
          7
        ]
      },
      {
        "sno": 3,
        "id": "h-factor1",
        "label": "h-factor",
        "top": 154,
        "type": "h-factor",
        "left": 274.4,
        "level": 2,
        "assetId": 44444444,
        "parent": [
          1
        ],
        "BMassetId": null
      },
      {
        "sno": 4,
        "id": "gics1",
        "label": "gics",
        "top": 156.4,
        "type": "gics",
        "left": 412,
        "level": 2,
        "assetId": 44444444,
        "parent": [
          1,
          7
        ],
        "child": [
          6
        ],
        "BMassetId": 55555555
      },
      {
        "sno": 6,
        "id": "liquidity1",
        "label": "liquidity",
        "top": 155.6,
        "type": "liquidity",
        "left": 132.8,
        "level": 2,
        "assetId": 44444444,
        "parent": [
          1
        ],
        "child": [
          6
        ]
      },
      {
        "sno": 6,
        "id": "marketcap1",
        "label": "marketcap",
        "top": 275.6,
        "type": "marketcap",
        "left": 272.8,
        "parent": [
          6,
          4
        ],
        "level": 3,
        "assetId": 44444444,
        "BMassetId": null
      },
      {
        "sno": 7,
        "id": "stockprice1",
        "label": "stockprice",
        "top": 156.4,
        "type": "stockprice",
        "left": 598.4,
        "parent": [
          2
        ],
        "assetId": 55555555,
        "level": 2,
        "child": [
          4
        ]
      }
    ],
    "connections": [
      {
        "source": "universe1",
        "target": "liquidity1"
      },
      {
        "source": "universe1",
        "target": "h-factor1"
      },
      {
        "source": "universe1",
        "target": "gics1"
      },
      {
        "source": "liquidity1",
        "target": "marketcap1"
      },
      {
        "source": "gics1",
        "target": "marketcap1"
      },
      {
        "source": "universe2",
        "target": "stockprice1"
      },
      {
        "source": "stockprice1",
        "target": "gics1"
      }
    ]
  };
  filterData: any = [
    {
      label: 'Universe',
      value: 'universe',
    },
    {
      label: 'Liquidity',
      value: 'liquidity',
    },
    {
      label: 'h-factor',
      value: 'h-factor',
    },
    {
      label: 'Gics',
      value: 'gics',
    },

    {
      label: 'Factors',
      value: 'factors',
    },
    {
      label: 'Market Cap',
      value: 'marketcap',
    },
    {
      label: 'Stock Price',
      value: 'stockprice',
    },
    {
      label: 'Stocks',
      value: 'stocks',
    },
    {
      label: 'Groups',
      value: 'group',
    },
    {
      label: 'Result',
      value: 'result',
    },
  ];
  cards: any = [];
  constructor(
    public sharedData: SharedDataService,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService,
    public cusIndexService: CustomIndexService
  ) {}
  filtername: any;

  ngOnInit() {
    var that = this;
    setTimeout(() => {
      that.sharedData.showCircleLoader.next(false);
    }, 1000);
    this.filtername = this.filterData;
    var equityIndexe = this.cusIndexService.equityIndexeMasData.subscribe(
      (res: boolean) => {}
    );
    this.subscriptions.add(equityIndexe);
    document.addEventListener('click', this.handleClickOutside.bind(this));
  }
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    document.removeEventListener('click', this.handleClickOutside.bind(this));
  }
  handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('#canvas-wrapper')) {
      // Remove 'switch-bg' class from all selected cards
      this.selectedCards.forEach((cardId: string) => {
        const cardElement = document.getElementById(cardId);
        if (cardElement) {
          cardElement.classList.remove('switch-bg');
        }
      });
      this.selectedCards.clear();
    }
  }
  universeList: any = [];
  loadUnivers() {
    var data: any = [...this.cusIndexService.equityIndexeMasData.value];
    if (data.length > 0) {
      data = data.filter(
        (obj1: any, i: any, arr: any) =>
          arr.findIndex((obj2: any) => obj2.assetId === obj1.assetId) === i
      );
      this.universeList = data.filter(
        (x: any) =>
          x.universe == 'Equity Universe' &&
          x.country == 'USA' &&
          x.erfFlag == 'Y'
      );
      this.selectUniverse =
        this.universeList.length > 0 ? this.universeList[0] : null;
      this.selectedItem =
        this.universeList.length > 0 &&
        isNotNullOrUndefined(this.universeList[0]['name'])
          ? this.universeList[0]['name']
          : null;
    } else {
      this.universeList = [];
    }
  }

  ngAfterViewInit() {
    this.jsPlumbInstance = jsPlumb.getInstance(this.defaultOptions);
    // this.jsPlumbInstance.setContainer('canvas');
    this.initiatePlumb();
    // Disallow self-connections
    this.jsPlumbInstance.bind('beforeDrop', (info: any) => {
      if (info.sourceId === info.targetId) {
        //console.error('Self-connections are not allowed.');
        return false; // Reject the connection
      }
      return true; // Allow other connections
    });
    this.cards.forEach((item: any) => { this.initDraggable(item.id); });
  }

  calculateHeight(card: any): number {
    if (card.type === 'subGrp' && card.subGrp) {
      if (card.subGrp.length === 0) {
        return 0; // No height if subGrp length is 0
      }
      return card.subGrp.length + 1;
    }
    return 1; // Default height
  }
  calculateHeightStyle(card: any): string {
    const height = this.calculateHeight(card);

    return height === 1 ? '44px' : `${height * 65}px`;
  }
  calculateHeightClass(card: any): string {
    if (card.type === 'subGrp' && card.subGrp) {
      if (card.subGrp.length === 0) {
        return 'no-height'; // Class for no height
      }
      return `height-${card.subGrp.length + 1}`; // Class for calculated height
    }
    return 'height-1'; // Default height class
  }
  trackByCardId(index: number, card: any): string {
    return card.id;
  }
  constrainPosition = (point: { x: number; y: number }, dragRef: any) => {
    //console.log(point, 'point');
    return {
      x: 0, // Restrict horizontal movement
      y: point.y, // Allow vertical movement
    };
  };
  drop(event: CdkDragDrop<any[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
    // Log the draggable data to the console
  }

  checkLeft(data: any) {
    var dta = [...data]
      .map((a) => ({ ...a }))
      .sort(function (x, y) {
        return d3.descending(parseFloat(x.left), parseFloat(y.left));
      });
    var left = dta[0].left + 100;
    return left;
  }
  checkTop(data: any) {
    var dta = [...data]
      .map((a) => ({ ...a }))
      .sort(function (x, y) {
        return d3.descending(parseFloat(x.top), parseFloat(y.top));
      });
    var left = dta[0].top + 80;
    return left;
  }
  checkUniverseLeft(cards: any[]): number {
    const defaultLeft = 100;
    const leftPositions = cards.map((card) => card.left);
    const maxLeft = Math.max(...leftPositions, defaultLeft);
    return maxLeft + 150; // Increment left position by 150
  }

  addDraggable(name: any) {
    var that = this;
    const selCard: any = this.selectedCards;
    const state = this.localJson;
    const newSno = state.cards.length + 1;
    var selGrp: boolean = false;
    if (selCard.size == 1) {
      this.selectedCards.forEach(
        (e: any) => (selGrp = e.startsWith('group') ? true : false)
      );
    }
    if (selGrp) {
      var selGrpname: string = '';
      this.selectedCards.forEach((e: any) =>
        e.startsWith('group') ? (selGrpname = e) : (selGrpname = '')
      );
      const cardIndex: number = state.cards.findIndex(
        (card: any) => card.id === selGrpname
      );
      if (cardIndex > -1) {
        if (isNullOrUndefined(state.cards[cardIndex].group)) {
          state.cards[cardIndex]['group'] = [];
        }
        const componentCount =
          state.cards[cardIndex].group.filter((grp: any) =>
            grp.label.startsWith(`${name}`)
          ).length + 1;
        const newCard = {
          sno: newSno,
          id: `${name}${componentCount}`,
          label: `${name}`,
          top: 25,
          type: name,
          left: 20,
        };
        state.cards[cardIndex].group.push(newCard);
        state.cards[cardIndex].group.forEach(
          (x: any, i: any) => (x.left = i * 150 + 20)
        );
        this.cards = state.cards;
        setTimeout(() => {
          that.initiatePlumb();
        });
      }
    } else if (name === 'universe') {
      const equityName = this.selectUniverse.name;
      const assetId = (isNotNullOrUndefined(this.selectUniverse.assetId)) ? this.selectUniverse.assetId : 0;
      const universeCount =
        state.cards.filter((cards: any) => cards.id.startsWith(`${name}`))
          .length + 1;

      setTimeout(() => {
        const existingUniverses = state.cards.filter((cards: any) =>
          cards.label.startsWith(`${equityName}`)
        );
        let labelName = equityName;
        if (existingUniverses.length > 0) {
          let count = existingUniverses.length + 1;
          labelName = `${equityName} ${count}`;
        }
        const newCard = {
          sno: newSno,
          id: `universe${universeCount}`,
          label: labelName,
          top: 10, // Add 100 to the top ,
          type: name,
          assetId: assetId,
          data: { name: equityName, assetId: assetId },
          level: 1,
          left: this.checkUniverseLeft(state.cards)
        };
        state.cards.push(newCard);
        this.cards = state.cards;
        that.initDraggable(newCard.id);
        that.initiatePlumb();
      }, 200);
    } else {
      const componentCount =
        state.cards.filter((cards: any) => cards.label.startsWith(`${name}`))
          .length + 1;
      var newCard: any = {
        sno: newSno,
        id: `${name}${componentCount}`,
        label: `${name}`,
        top: this.checkTop(state.cards), // Add 100 to the top ,
        type: name,
        left: this.checkLeft(state.cards),
      };
      if (name === 'group') {
        newCard['group'] = [];
      }
      state.cards.push(newCard);
      this.cards = state.cards;
      setTimeout(() => {
        that.initDraggable(newCard.id);
        that.initiatePlumb();
      });
    }
    // console.log(this.cards,'this cards')
  }
  private previousPositions: { [id: string]: { top: number; left: number } } = {};

  initDraggable(elementId: string) {
    interact(`#${elementId}`)
      .draggable({
        listeners: {
          move: (event) => {
            this.isDragging = true;
            const target = event.target;

            // Get the current top and left position of the element
            const currentTop = parseFloat(target.style.top) || 0;
            const currentLeft = parseFloat(target.style.left) || 0;

            // Calculate the new position
            const newTop = currentTop + event.dy;
            const newLeft = currentLeft + event.dx;

            // Update the top and left position
            target.style.top = `${newTop}px`;
            target.style.left = `${newLeft}px`;

            // if (this.isColliding(target)) {
            //   // Revert to the original position if collision is detected
            //   target.style.top = `${currentTop}px`;
            //   target.style.left = `${currentLeft}px`;

            // } else {
            //   // Update the position and revalidate if no collision
            //   this.jsPlumbInstance.revalidate(target.id);
            // }
            this.jsPlumbInstance.revalidate(target.id);
          },
          end: (event) => {
            // console.log(' Dragging stopped');
            const target = event.target;

            // Save the new position after dragging ends
            const updatedCard = this.cards.find(
              (card: any) => card.id === target.id
            );
            if (updatedCard) {
              updatedCard.top = parseFloat(target.style.top);
              updatedCard.left = parseFloat(target.style.left);
            }
            this.isDragging = false; // Reset dragging state to false
          },
        },
      })
      .on('tap', (event) => {
        const tappedElement = event.currentTarget;
        if (tappedElement && tappedElement.id) {
          this.toggleSelection(tappedElement.id);
        }
      });
   // console.log(this.cards);
  }

  groups: any = [];
  groupChildClick(data: any, e: any) {
    e.stopPropagation();
    //console.log(data.group, 'groupChildClick');
    this.groups = data.group;
    this.groups.forEach((item: any) => {
      // this.initDraggable(item.id);
    });
    // this.toggleSelection(childCardId);
  }
  isColliding(currentElement: HTMLElement): boolean {
    const currentRect = currentElement.getBoundingClientRect();

    // Loop through all cards to check for collisions
    for (const card of this.cards) {
      if (card.id !== currentElement.id) {
        // Exclude the current card
        const otherElement = document.getElementById(card.id);
        if (otherElement) {
          const otherRect = otherElement.getBoundingClientRect();

          // Check if rectangles overlap
          if (
            currentRect.left < otherRect.right &&
            currentRect.right > otherRect.left &&
            currentRect.top < otherRect.bottom &&
            currentRect.bottom > otherRect.top
          ) {
            return true; // Collision detected
          }
        }
      }
    }
    return false; // No collision
  }

  isSelected: boolean = false;
  isGroupSelected = false;
  selectedCards: Set<string> = new Set();
  toggleSelection(elementId: string) {
    //console.log(this.cards, 'this.cards');
    //console.log(elementId, 'elementId');
    const originalString = elementId.slice(0, -1);

    if (originalString == 'universe') {
      const id = parseInt(elementId.replace('universe', ''), 10);
      const card = this.cards.find(
        (item: any) => parseInt(item.id.replace('universe', '')) === id
      );
      if (card) {
        if (this.selectedCards.size < 2 && !this.selectedCards.has(card.id)) {
          this.selectedCards.add(card.id);
          const cardElement = document.getElementById(card.id);
          //console.log(cardElement, 'cardElement');
          if (cardElement) {
            cardElement.classList.add('switch-bg');
          }
        } else if (this.selectedCards.has(card.id)) {
          this.selectedCards.delete(card.id);
          const cardElement = document.getElementById(card.id);
          if (cardElement) {
            cardElement.classList.remove('switch-bg');
          }
        } else {
          const secondCardId = Array.from(this.selectedCards)[1];
          this.selectedCards.delete(secondCardId);
          const secondCardElement = document.getElementById(secondCardId);
          if (secondCardElement) {
            secondCardElement.classList.remove('switch-bg');
          }
          this.selectedCards.add(card.id);
          const cardElement = document.getElementById(card.id);
          if (cardElement) {
            cardElement.classList.add('switch-bg');
          }
        }
      }
    } else {
      // console.log(elementId,'elementId')
      const id = elementId;
      const card = this.cards.find((item: any) => item.id === id);
      // console.log(card,'elementId after')
      if (card) {
        if (this.selectedCards.size < 2 && !this.selectedCards.has(card.id)) {
          this.selectedCards.add(card.id);
          const cardElement = document.getElementById(card.id);
          if (cardElement) {
            // console.log('add')
            if (card.type == 'group') {
              this.isGroupSelected = !this.isGroupSelected;
            }
            cardElement.classList.add('switch-bg');
          }
        } else if (this.selectedCards.has(card.id)) {
          this.selectedCards.delete(card.id);
          const cardElement = document.getElementById(card.id);
          if (cardElement) {
            if (card.type == 'group') {
              // console.log('group remove')
              this.isGroupSelected = !this.isGroupSelected;
            }
            cardElement.classList.remove('switch-bg');
          }
        } else {
          // Remove the second card from the selection
          const secondCardId = Array.from(this.selectedCards)[1];
          this.selectedCards.delete(secondCardId);
          const secondCardElement = document.getElementById(secondCardId);
          if (secondCardElement) {
            secondCardElement.classList.remove('switch-bg');
          }

          // Add the new card to the selection
          this.selectedCards.add(card.id);
          const cardElement = document.getElementById(card.id);
          if (cardElement) {
            cardElement.classList.add('switch-bg');
          }
        }
      }
    }

    // console.log('Selected IDs:', Array.from(this.selectedCards));
    if (this.selectedCards.size === 2) {
      const cardIds = Array.from(this.selectedCards);
      const sourceId = cardIds[0];
      const targetId = cardIds[1];
      //console.log('Selected IDs:', Array.from(this.selectedCards));
      const existingConnection = this.localJson.connections.find(
        (connection: any) => {
          return (
            (connection.source === sourceId &&
              connection.target === targetId) ||
            (connection.source === targetId && connection.target === sourceId)
          );
        }
      );
      if (existingConnection) {
       // console.log(existingConnection, 'before');
        const removeConnectorButton = document.querySelector(
          '.mod-foot-btn-activeError'
        );
        if (removeConnectorButton) {
          removeConnectorButton.removeAttribute('disabled');
        }
      } else {
       // console.log(existingConnection, 'after');
        const removeConnectorButton = document.querySelector(
          '.mod-foot-btn-activeError'
        );
        if (removeConnectorButton) {
          removeConnectorButton.setAttribute('disabled', 'true');
        }
      }
    } else {
      const removeConnectorButton = document.querySelector(
        '.mod-foot-btn-activeError'
      );
      if (removeConnectorButton) {
        removeConnectorButton.setAttribute('disabled', 'true');
      }
    }
  }

  cardDel: any;
  cardChildDel: any;
  deleteCardClick(id: any) {
    this.cardDel = id;
    this.cardChildDel = null;
  }

  deleteCardChildClick(id: any, childid: any) {
    this.cardDel = id;
    this.cardChildDel = childid;
  }

  deleteSelected(selCard: any) {
    const state: any = this.localJson;
    this.cards = [];
    if (isNotNullOrUndefined(this.cardChildDel)) {
      const cardIndex: number = state.cards.findIndex(
        (card: any) => card.id === selCard
      );
      if (cardIndex > -1) {
        const cardchildIndex: any = state.cards[cardIndex]?.group.findIndex(
          (grp: any) => grp.id === this.cardChildDel
        );
        if (cardchildIndex > -1) {
          state.cards[cardIndex].group = state.cards[cardIndex]?.group.filter(
            (grp: any) => grp.id !== this.cardChildDel
          );
          state.cards[cardIndex]?.group.forEach(
            (x: any, i: any) => (x.left = i * 150 + 20)
          );
          this.localJson['cards'] = state.cards;
          this.cards = state.cards;
        }
      }
    } else {
      this.deletedId.push(this.cardDel);
      if (this.jsPlumbInstance) {
        this.jsPlumbInstance.remove(selCard);
      }
      const filteredCards = state.cards.filter(
        (card: any) => !this.selectedCards.has(card.id)
      );
      this.localJson['cards'] = filteredCards;
      this.cards = filteredCards;
    }
    const filteredConnections = state.connections.filter((connection: any) => {
      return (
        !this.selectedCards.has(connection.source) &&
        !this.selectedCards.has(connection.target)
      );
    });
    this.localJson['connections'] = filteredConnections;
    this.selectedCards = new Set();
    this.selectedCards.forEach((cardId: any) => {
      if (this.jsPlumbInstance) {
        this.jsPlumbInstance.remove(cardId); // Removes the element and connections
      }
    });
    this.initiatePlumb();
    // console.log(this.localJson, 'localJson after')
    // console.log(this.selectedCards, 'selectedCards')
    ////this.cards.forEach((card: any) => {
    ////  console.log(  card,'deleteSelected')

    //////const cardElement = document.createElement('div');
    //////cardElement.id = card.id;
    //////cardElement.className = 'card';
    //////cardElement.style.top = `${card.top}px`;
    //////cardElement.style.left = `${card.left}px`;
    //////cardElement.innerText = card.label;

    //////document.getElementById('canvas')?.appendChild(cardElement);
    ////this.jsPlumbInstance.addEndpoint(card.id, {
    ////  anchor: ['Top', 'Bottom'], // Flexible anchor points
    ////  isSource: true, // Card can be the source of a connection
    ////  isTarget: true, // Card can be the target of a connection
    ////  maxConnections: -1, // Allow unlimited connections
    ////  connector: ['Flowchart', { stub: 50, gap: 10, cornerRadius: 5 }],
    ////  overlays: [['Arrow', { width: 10, length: 10, location: 1 }]]
    ////});
    ////// Make cards draggable

    ////// Add endpoints for jsPlumb
    ////this.jsPlumbInstance.addEndpoint(card.id, {
    ////  anchor: ['Top', 'Bottom'],
    ////  isSource: true,
    ////  isTarget: true,
    ////});
    ////})
    //// // Restore connections
    //// state.connections.forEach((connection: any) => {
    ////  this.jsPlumbInstance.connect({
    ////    source: connection.source,
    ////    target: connection.target,
    ////    overlays: [['Arrow', { width: 10, length: 10, location: 1 }]]
    ////  });
    ////});

    //// console.log(filteredCards,'filteredCards')
  }
  trackCardById(index: number, card: any) {
    return card.id;
  }
  initiatePlumb() {
    const state = this.localJson;
    // Clear existing cards and connections
    // console.log(state,'this.state')
    this.cards = [];
    this.jsPlumbInstance.deleteEveryConnection();
    //this.jsPlumbInstance.empty('canvas');
    // console.log(state.cards,'this.initiatePlumb')
    this.cards = state.cards;

    // Wait for the cards to be rendered

    setTimeout(() => {
      // Add endpoints for all cards
      state.connections.forEach((connection: any) => {
        this.jsPlumbInstance.connect({
          source: connection.source,
          target: connection.target,
          anchor: 'AutoDefault',
        });
      });
      // this.cards.forEach((card: any) => {
      //   this.jsPlumbInstance.addEndpoint(card.id, {
      //     anchor: ['Top', 'Bottom'],
      //     isSource: true,
      //     isTarget: true,
      //     maxConnections: -1,
      //     overlays: [['Arrow', { width: 10, length: 10, location: 1 }]],
      //   });
      // });
      // Add class dynamically based on label
      this.cards.forEach((card: any) => {
        const cardElement = document.getElementById(card.id);
        if (cardElement && card.id.includes('universe')) {
          cardElement.classList.add('universe-class');
        }
      });
      // Restore connections
      state.connections.forEach((connection: any) => {
        this.jsPlumbInstance.connect({
          source: connection.source,
          target: connection.target,
          anchor: 'AutoDefault',
          overlays: [['Arrow', { width: 10, length: 10, location: 1 }]],
        });
      });
    });
    // Restore cards
    ////state.cards.forEach((card: any) => {
    ////  this.cards.push(card);
    ////  console.log(this.cards,'this.cards')
    ////  // Create DOM elements dynamically
    ////  const cardElement = document.createElement('div');
    ////  cardElement.id = card.id;
    ////  cardElement.className = 'card';
    ////  cardElement.style.top = `${card.top}px`;
    ////  cardElement.style.left = `${card.left}px`;
    ////  cardElement.innerText = card.label;

    ////  document.getElementById('canvas')?.appendChild(cardElement);
    ////  // Add endpoints to the card
    ////  this.jsPlumbInstance.addEndpoint(card.id, {
    ////    anchor: ['Top', 'Bottom'], // Flexible anchor points
    ////    isSource: true, // Card can be the source of a connection
    ////    isTarget: true, // Card can be the target of a connection
    ////    maxConnections: -1, // Allow unlimited connections
    ////    connector: ['Flowchart', { stub: 50, gap: 10, cornerRadius: 5 }],
    ////    overlays: [['Arrow', { width: 10, length: 10, location: 1 }]]
    ////    //connector: ['Bezier', { curviness: 10 }], // Connection style
    ////    //connector: ['Flowchart', { stub: [40, 60], gap: 10 }],
    ////    //overlays: [['Arrow', { width: 10, length: 10, location: 1 }]],
    ////    //overlays: [['Arrow', { width: 10, length: 10, location: 1 }]] // Add arrows to connections
    ////  });
    ////  // Make cards draggable

    ////  // Add endpoints for jsPlumb
    ////  this.jsPlumbInstance.addEndpoint(card.id, {
    ////    anchor: ['Top', 'Bottom'],
    ////    isSource: true,
    ////    isTarget: true,
    ////  });
    ////});

    ////// Restore connections
    ////state.connections.forEach((connection: any) => {
    ////  this.jsPlumbInstance.connect({
    ////    source: connection.source,
    ////    target: connection.target,
    ////    overlays: [['Arrow', { width: 10, length: 10, location: 1 }]]
    ////  });
    ////});
  }
  saveState() {
    const updatedState = {
      cards: this.cards.map((card: any) => ({
        id: card.id,
        label: card.label,
        top: card.top,
        left: card.left,
      })),
      connections: this.jsPlumbInstance
        .getConnections()
        .map((connection: any) => ({
          source: connection.sourceId,
          target: connection.targetId,
        })),
    };

    //console.log('Saved State:', updatedState);
  }

  // Method to delete a card
  deleteCard(id: string) {
    this.jsPlumbInstance.removeAllEndpoints(id);
    this.cards = this.cards.filter((card: any) => card.id !== id);
  }

  removeSelectedCards() {
    if (this.selectedCards.size !== 2) {
      this.toastr.info('Please select exactly two cards to remove the connection.', '', { timeOut: 3000 });
      return;
    }

    const [sourceId, targetId] = Array.from(this.selectedCards);
    const sourceCard = this.localJson.cards.find((card: any) => card.id === sourceId);
    const targetCard = this.localJson.cards.find((card: any) => card.id === targetId);

    if (!sourceCard || !targetCard) return;

    // Check if the two cards are connected
    const existingConnection = this.localJson.connections.some((connection: any) =>
      (connection.source === sourceId && connection.target === targetId) ||
      (connection.source === targetId && connection.target === sourceId)
    );

    if (!existingConnection) {
      this.toastr.info('The selected cards are not connected.', '', { timeOut: 3000 });
      return;
    }

    // Remove child and parent relationships
    this.updateCardRelationships(sourceCard, targetCard, false);

    // Remove the connection from jsPlumb and localJson
    this.jsPlumbInstance.deleteConnectionsForElement(sourceId);
    this.jsPlumbInstance.deleteConnectionsForElement(targetId);

    this.localJson.connections = this.localJson.connections.filter((connection: any) =>
      !((connection.source === sourceId && connection.target === targetId) ||
        (connection.source === targetId && connection.target === sourceId))
    );

    // Update the local JSON
    this.localJson = { ...this.localJson };

    // Clear selected cards and UI updates
    this.selectedCards.clear();
    this.updateUIForSelectedCards([sourceId, targetId]);

    this.toastr.info('Connection removed successfully', '', { timeOut: 3000 });
    this.initiatePlumb();
  }

  // Helper function to update card relationships
  updateCardRelationships(sourceCard: any, targetCard: any, isAdding: boolean) {
    const sourceInd = this.localJson.cards.findIndex((card: any) => card.id === sourceCard.id);
    const targetInd = this.localJson.cards.findIndex((card: any) => card.id === targetCard.id);

    if (sourceInd > -1 && sourceCard.child) {
      const updatedChildren = isAdding ? [...sourceCard.child, targetCard.sno] : sourceCard.child.filter((sno: any) => sno !== targetCard.sno);
      this.localJson.cards[sourceInd].child = updatedChildren;
    }

    if (targetInd > -1 && targetCard.parent) {
      const updatedParents = isAdding ? [...targetCard.parent, sourceCard.sno] : targetCard.parent.filter((sno: any) => sno !== sourceCard.sno);
      this.localJson.cards[targetInd].parent = updatedParents;

      if (targetCard.BMassetId === sourceCard.assetId) {
        this.localJson.cards[targetInd].BMassetId = null;
      }
    }
  }

  // Helper function to update UI for selected cards
  updateUIForSelectedCards(cardIds: string[]) {
    cardIds.forEach((cardId) => {
      const cardElement = document.getElementById(cardId);
      if (cardElement) {
        cardElement.classList.remove('switch-bg');
      }
    });
  }

  connectSelectedCards() {
    if (this.selectedCards.size !== 2) {
      return;
    }

    const [sourceId, targetId] = Array.from(this.selectedCards);
    const sourceCard = this.localJson.cards.find((card: any) => card.id === sourceId);
    const targetCard = this.localJson.cards.find((card: any) => card.id === targetId);

    if (!sourceCard || !targetCard) return;

    // Handle "universe" card restrictions
    if ((sourceCard?.type === "universe" && targetCard?.type === "universe") ||
      (targetCard?.type === "universe" && sourceCard?.type !== "universe")) {
      this.toastr.info('Cannot connect universe cards as specified.', '', { timeOut: 4000 });
      return;
    }

    // Check if a connection already exists
    const existingConnection = this.localJson.connections.some((connection: any) =>
      (connection.source === sourceId && connection.target === targetId) ||
      (connection.source === targetId && connection.target === sourceId)
    );
    if (existingConnection) {
      this.toastr.info('Cards are already connected', '', { timeOut: 4000 });
      return;
    }

    // Check the connection validity
    const connectionCheck = this.checkConnection(sourceCard, targetCard);
    if (!connectionCheck.rtnType) {
      this.toastr.info(connectionCheck.message, '', { timeOut: 4000 });
      return;
    }

    // Update source card's children and target card's parent
    this.updateCardRelations(sourceCard, targetCard);

    // Create the connection in jsPlumb
    this.jsPlumbInstance.connect({
      source: sourceId,
      target: targetId,
      detachable: false,
      Connector: ['Flowchart', { stub: [5, 10], gap: 10, cornerRadius: 10 }],
      overlays: [['Arrow', { width: 10, length: 10, location: 1 }]],
      anchor: "AutoDefault",
    });

    // Add to connections and update localJson
    this.localJson.connections.push({ source: sourceId, target: targetId });
    this.localJson = { ...this.localJson };

    // Clear selection
    document.querySelectorAll(`#${sourceId}, #${targetId}`).forEach((element: any) => {
      element.classList.remove('switch-bg');
    });

    this.selectedCards.clear();
    this.isGroupSelected = false;
    //console.log(this.localJson)
  }

  updateCardRelations(sourceCard: any, targetCard: any) {
    const sourceInd = this.localJson.cards.findIndex((card: any) => card.id === sourceCard.id);
    const targetInd = this.localJson.cards.findIndex((card: any) => card.id === targetCard.id);

    if (sourceInd > -1) {
      const sourceChild = this.localJson.cards[sourceInd].child || [];
      this.localJson.cards[sourceInd].child = [...sourceChild, targetCard.sno];
    }

    if (targetInd > -1) {
      const targetParent = this.localJson.cards[targetInd].parent || [];
      const sourceLevel = sourceCard.level ?? -1;
      const assetId = sourceCard.assetId ?? null;
      const curAssetId = this.localJson.cards[targetInd].assetId ?? null;

      this.localJson.cards[targetInd].parent = [...targetParent, sourceCard.sno];

      if (assetId && curAssetId && assetId !== curAssetId) {
        this.localJson.cards[targetInd].BMassetId = assetId;
      } else {
        this.localJson.cards[targetInd].assetId = assetId;
        this.localJson.cards[targetInd].level = sourceLevel + 1;
      }
    }
  }

  checkConnection(sourceCard: any, targetCard: any) {
    const rtn = { rtnType: true, message: '' };

    // Check if the source card has a parent unless it's a "universe" type card
    if (isNullOrUndefined(sourceCard['parent']) && sourceCard['type'] !== 'universe') {
      return { rtnType: false, message: 'Source card parent missing' };
    }

    const sourceAssetId = sourceCard['assetId'];
    const targetAssetId = targetCard['assetId'];

    // Check if source and target cards have the same parent and assetId (same level condition)
    if (isNotNullOrUndefined(sourceCard['parent']) && isNotNullOrUndefined(targetCard['parent']) &&
      sourceCard['parent'][0] === targetCard['parent'][0] &&
      sourceAssetId === targetAssetId) {
      return { rtnType: false, message: 'Both card same level' };
    }

    // Check if source card's level is greater than target card's level (same assetId)
    if (isNotNullOrUndefined(sourceCard['level']) && isNotNullOrUndefined(targetCard['level']) &&
      sourceCard['level'] > targetCard['level'] && sourceAssetId === targetAssetId) {
      return { rtnType: false, message: 'Source level is high' };
    }

    // Check if the source card already has a child connected to a different universe
    if (isNotNullOrUndefined(sourceAssetId) && isNotNullOrUndefined(sourceCard['child']) && sourceCard['child'].length > 0) {
      const childCard = this.localJson.cards.find((x: any) => x.sno === sourceCard['child'][0]);
      if (childCard && sourceAssetId !== childCard['assetId']) {
        return { rtnType: false, message: 'Source already connected to a different universe' };
      }
    }

    // Check if source and target cards are from different universes (assetId mismatch)
    if (sourceAssetId && targetAssetId && sourceAssetId !== targetAssetId) {
      const connectedCards = this.localJson.cards.filter((x: any) => x?.assetId === targetAssetId && x?.BMassetId === sourceAssetId);
      if (connectedCards.length > 0) {
        return { rtnType: false, message: 'Source already connected to another universe' };
      }

      // Check if source universe has children and can't be connected to another universe
      if (isNotNullOrUndefined(sourceCard['child']) && sourceCard['child'].length > 0) {
        return { rtnType: false, message: 'Source universe has children, cannot connect to another universe' };
      }
    }

    return rtn;
  }

  checkError(d: any) {
    if ((isNotNullOrUndefined(d['child']) && d['child'].length > 0) || (isNotNullOrUndefined(d['type']) && d['type'] == 'result')) { return false; }
    else { return true; }
  }

  compareFn(option1: any, option2: any): boolean {
    return option1 === option2;
  }
  selectUniverse: any;
  acccountChange(value: any) {
    this.selectUniverse = value;
    // console.log(value,'universeCount')
    const universeString = value.universe;
    const lowerUniverse = universeString.toLowerCase().split(' ')[1];

    if (lowerUniverse == 'universe') {
      // console.log(lowerUniverse,'universeCount')
      this.addDraggable(lowerUniverse);
    }
  }

  onOptionChange(event: any, val: any): void {
    this.selectUniverse = val;
  }

  addUniverse() {
    if (isNotNullOrUndefined(this.selectUniverse)) {
      //console.log(this.selectUniverse, 'this.selectUniverse')
      const universeString = this.selectUniverse.universe;
      const lowerUniverse = universeString.toLowerCase().split(" ")[1];
      if (lowerUniverse === "universe" && this.checkUniverse(this.selectUniverse, this.localJson)) {
        this.addDraggable(lowerUniverse);
      } else { this.toastr.info(this.selectUniverse['name'] + ' universe is already added. Select other univrses.', '', { timeOut: 3000 }); }
    }
  }

  checkUniverse(d: any, data: any) {
    if (isNotNullOrUndefined(data['cards'])) {
      var assetId: number = (isNotNullOrUndefined(d['assetId'])) ? d['assetId'] : 0;
      var fil = data['cards'].filter((x: any) => assetId == x?.assetId);
      if (fil.length > 0) { return false } else { return true }
    } else { return true }
  }

  backToUniverse() {
    this.isUniverse = !this.isUniverse;
  }
  showUniverse(value: any) {
    this.isUniverse = !this.isUniverse;
    this.loadUnivers();
  }
  selectedByChange(value: any) {
    if (value === 'universe') {
      const state = this.localJson;
      const newSno = state.cards.length + 1;
      const universeCount =
        state.cards.filter((cards: any) => cards.label.startsWith('Universe'))
          .length + 1;
      // console.log(universeCount,'universeCount')
      const newCard = {
        sno: newSno,
        id: `universe${universeCount}`,
        label: `Universe ${universeCount}`,
        top: 0, // Add 100 to the top ,
        left: this.checkUniverseLeft(state.cards),
      };
      state.cards.push(newCard);
      this.cards = state.cards;
      setTimeout(() => {
        this.initDraggable(newCard.id);
        this.initiatePlumb();
      });
    } else {
      const state = this.localJson;
      const newSno = state.cards.length + 1;
      const componentCount =
        state.cards.filter((cards: any) => cards.label.startsWith('Component'))
          .length + 1;
      // console.log((componentCount * 100) / 100 + 1,'componentCount')
      const cardcalc = (componentCount * 100) / 100 + 1;
      const newCard = {
        sno: newSno,
        id: `component${cardcalc}`,
        label: `Component ${cardcalc}`,
        top: this.checkTop(state.cards), // Add 100 to the top ,
        left: this.checkLeft(state.cards),
      };
      state.cards.push(newCard);
      this.cards = state.cards;
      //this.checkLeft(this.cards);
      setTimeout(() => {
        this.initDraggable(newCard.id);
        this.initiatePlumb();
      });
    }
    // console.log(this.cards,'this cards')
  }

  zoomIn() {
    if (!this.isDragging) {
      // Prevent zooming while dragging
      this.zoomLevel += 0.1;
      this.applyTransform();
    }
  }
  zoomOut() {
    if (!this.isDragging) {
      // Prevent zooming while dragging
      this.zoomLevel = Math.max(this.zoomLevel - 0.1, 0.1);
      this.applyTransform();
    }
  }
  resetZoom() {
    if (!this.isDragging) {
      // Prevent resetting zoom while dragging
      this.zoomLevel = 1;
      this.canvasPosition = { x: 0, y: 0 };
      this.applyTransform();
    }
  }
  applyTransform() {
    const canvas = document.getElementById('zoomPanel');
    if (canvas) {
      canvas.style.transform = `translate(${this.canvasPosition.x}px, ${this.canvasPosition.y}px) scale(${this.zoomLevel})`;
    }
    // Repaint connections
    this.jsPlumbInstance.repaintEverything();
  }
  startPan(event: MouseEvent) {
    if (!this.isDragging) {
      // Prevent panning while dragging
      this.isPanning = true;
      this.startX = event.clientX - this.canvasPosition.x;
      this.startY = event.clientY - this.canvasPosition.y;
    }
  }
  pan(event: MouseEvent) {
    if (this.isPanning && !this.isDragging) {
      // Allow panning only if not dragging
      this.canvasPosition.x = event.clientX - this.startX;
      this.canvasPosition.y = event.clientY - this.startY;
      this.applyTransform();
    }
  }
  endPan() {
    if (!this.isDragging) {
      // Prevent ending pan while dragging
      this.isPanning = false;
    }
  }
  istrigger: boolean = true;
  parentMethod(data: any) {
    //console.log(data, 'data');
    this.istrigger = data.triggered;
    //console.log(this.istrigger, 'data');
  }
  getIconClass(filterValue: string): string {
    switch (filterValue) {
      case 'universe':
        return 'universebg';
      case 'group':
        return 'groupbg';
      case 'liquidity':
        return 'liquiditybg';
      case 'h-factor':
        return 'h-factorbg';
      case 'gics':
        return 'gicsbg';
      case 'factors':
        return 'factorsbg';
      case 'marketcap':
        return 'marketCapbg';
      case 'stockprice':
        return 'stockpricebg';
      case 'stocks':
        return 'stocksbg';

      default:
        return 'resultbg';
    }
  }
}
