import { Injectable } from "@nestjs/common";
import { IsometricEntity, WorkStatusType } from "@database/entities";
import { WeldListEntity } from "@modules/weld-list/entities";
import { WeldListRepository } from "@modules/weld-list/weld-list.repository";
import { AssemblyListEntity } from "@modules/assembly-list/entities";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { WeldEntity } from "@modules/weld/entities";

@Injectable()
export class WeldListService {
  constructor(
    private readonly weldListRepository: WeldListRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async getById(id: number): Promise<WeldListEntity> {
    return this.weldListRepository.findFullByIdOrFail(id);
  }

  async getToDo(): Promise<WeldListEntity[]> {
    const lists = await this.weldListRepository.findFullAll();
    return lists.filter((weldList) => {
      const statuses = weldList.workStatuses.getItems();
      const lastStatus = statuses[statuses.length - 1];
      return lastStatus.workStatusType.name !== WorkStatusType.FINISHED;
    });
  }

  async updateWorkStatusToWorking(
    weldList: WeldListEntity,
    userId: number,
  ): Promise<WeldListEntity> {
    const workStatus = weldList.workStatuses[weldList.workStatuses.length - 1];

    if (
      workStatus.workStatusType.name === WorkStatusType.WORKING ||
      workStatus.workStatusType.name === WorkStatusType.FINISHED
    ) {
      return this.weldListRepository.populateToFull(weldList);
    }

    const newWeldList = await this.weldListRepository.updateWorkStatusToWorking(
      weldList,
      userId,
    );

    const populatedWeldList =
      await this.weldListRepository.populateToFull(newWeldList);

    this.eventEmitter.emit(
      "weld.updateWorkStatusToWorking",
      populatedWeldList,
      userId,
    );

    return populatedWeldList;
  }

  async updateWorkStatusToFinished(
    weldList: WeldListEntity,
    userId: number,
  ): Promise<WeldListEntity> {
    const newWeldList =
      await this.weldListRepository.updateWorkStatusToFinished(
        weldList,
        userId,
      );

    const populatedWeldList =
      await this.weldListRepository.populateToFull(newWeldList);

    this.eventEmitter.emit(
      "weld.updateWorkStatusToFinished",
      populatedWeldList,
      userId,
    );

    return populatedWeldList;
  }

  async createForIsometric(
    isometric: IsometricEntity,
    userId: number,
  ): Promise<WeldListEntity[]> {
    const weldLists: WeldListEntity[] = [];
    const sheets = isometric.sheets.getItems();
    for (const sheet of sheets) {
      const revisions = sheet.revisions.getItems();
      if (!revisions.length) continue;
      const lastRevision = revisions[revisions.length - 1];
      for (const spool of lastRevision.spools.getItems()) {
        const weldList = await this.weldListRepository.create(spool.id, userId);
        weldLists.push(weldList);
      }
    }
    return weldLists;
  }

  @OnEvent("weld.updateWorkStatusToFinished", { async: true })
  async handleWorkStatusToFinished(
    weld: WeldEntity,
    userId: number,
  ): Promise<WeldListEntity> {
    const weldList = await this.weldListRepository.findMinimalByWeldIdOrFail(
      weld.id,
    );
    const workStatus = weldList.workStatuses[weldList.workStatuses.length - 1];

    if (
      (await this.isWeldListFinished(weldList)) &&
      workStatus.workStatusType.name !== WorkStatusType.FINISHED
    ) {
      return this.updateWorkStatusToFinished(weldList, userId);
    }

    return this.weldListRepository.populateToFull(weldList);
  }

  @OnEvent("assembly-list.updateWorkStatusToFinished", { async: true })
  async handleCreateWeldLists(
    assemblyList: AssemblyListEntity,
    userId: number,
  ): Promise<WeldListEntity[]> {
    const weldLists = await this.createForIsometric(
      assemblyList.isometric,
      userId,
    );
    const ids = weldLists.map((weld) => weld.id);

    const newWeldLists = await this.weldListRepository.findFullByIdsOrFail(ids);

    this.eventEmitter.emit("weld-list.creates", newWeldLists);

    return newWeldLists;
  }

  async isWeldListFinished(weldList: WeldListEntity): Promise<boolean> {
    weldList = await this.weldListRepository.populateToFull(weldList);

    const joints = weldList.spool.joints.getItems();
    for (const joint of joints) {
      for (const weld of joint.welds.getItems()) {
        const workStatuses = weld.workStatuses.getItems();
        if (workStatuses.length === 0) {
          return false;
        }
        const lastStatus = workStatuses[workStatuses.length - 1];
        if (lastStatus.workStatusType.name !== WorkStatusType.FINISHED) {
          return false;
        }
      }
    }
    return true;
  }
}
