import { Injectable } from "@nestjs/common";
import { AssemblyListEntity } from "@modules/assembly-list/entities";
import { AssemblyListRepository } from "@modules/assembly-list/assembly-list.repository";
import { CutListEntity } from "@modules/cut-list/entities";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { WorkStatusType } from "@database/entities";
import { JointEntity } from "@modules/joint/entities";

@Injectable()
export class AssemblyListService {
  constructor(
    private readonly assemblyListRepository: AssemblyListRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async getById(id: number): Promise<AssemblyListEntity> {
    return this.assemblyListRepository.findFullByIdOrFail(id);
  }

  async getToDo(): Promise<AssemblyListEntity[]> {
    const lists = await this.assemblyListRepository.findFullAll();
    return lists.filter((assemblyList) => {
      const statuses = assemblyList.workStatuses.getItems();
      const lastStatus = statuses[statuses.length - 1];
      return lastStatus.workStatusType.name !== WorkStatusType.FINISHED;
    });
  }

  async updateWorkStatusToWorking(
    assemblyList: AssemblyListEntity,
    userId: number,
  ): Promise<AssemblyListEntity> {
    const workStatus =
      assemblyList.workStatuses[assemblyList.workStatuses.length - 1];

    if (
      workStatus.workStatusType.name === WorkStatusType.WORKING ||
      workStatus.workStatusType.name === WorkStatusType.FINISHED
    ) {
      return this.assemblyListRepository.populateToFull(assemblyList);
    }

    const newAssemblyList =
      await this.assemblyListRepository.updateWorkStatusToWorking(
        assemblyList,
        userId,
      );

    const populatedAssemblyList =
      await this.assemblyListRepository.populateToFull(newAssemblyList);

    this.eventEmitter.emit(
      "assembly-list.updateWorkStatusToWorking",
      populatedAssemblyList,
      userId,
    );

    return populatedAssemblyList;
  }

  async updateWorkStatusToFinished(
    assemblyList: AssemblyListEntity,
    userId: number,
  ): Promise<AssemblyListEntity> {
    const newCutList =
      await this.assemblyListRepository.updateWorkStatusToFinished(
        assemblyList,
        userId,
      );

    const populatedAssemblyList =
      await this.assemblyListRepository.populateToFull(newCutList);

    this.eventEmitter.emit(
      "assembly-list.updateWorkStatusToFinished",
      populatedAssemblyList,
      userId,
    );

    return populatedAssemblyList;
  }

  @OnEvent("joint.updateWorkStatusToFinished", { async: true })
  async handleWorkStatusToFinished(
    joint: JointEntity,
    userId: number,
  ): Promise<AssemblyListEntity> {
    const assemblyList =
      await this.assemblyListRepository.findMinimalByJointIdOrFail(joint.id);
    const workStatus =
      assemblyList.workStatuses[assemblyList?.workStatuses.length - 1];

    if (
      (await this.isAssemblyListFinished(assemblyList)) &&
      workStatus.workStatusType.name !== WorkStatusType.FINISHED
    ) {
      return this.updateWorkStatusToFinished(assemblyList, userId);
    }

    return this.assemblyListRepository.populateToFull(assemblyList);
  }

  @OnEvent("cut-list.updateWorkStatusToFinished", { async: true })
  async handleCreateAssemblyList(
    cutList: CutListEntity,
    userId: number,
  ): Promise<AssemblyListEntity> {
    const assemblyList = await this.assemblyListRepository.create(
      cutList.isometric.id,
      userId,
    );

    const populatedAssemblyList =
      await this.assemblyListRepository.populateToFull(assemblyList);

    this.eventEmitter.emit(
      "assembly-list.create",
      populatedAssemblyList,
      userId,
    );

    return populatedAssemblyList;
  }

  async isAssemblyListFinished(
    assemblyList: AssemblyListEntity,
  ): Promise<boolean> {
    assemblyList =
      await this.assemblyListRepository.populateToFull(assemblyList);

    const sheets = assemblyList.isometric.sheets.getItems();
    for (const sheet of sheets) {
      const revisions = sheet.revisions.getItems();
      if (!revisions.length) continue;
      const lastRev = revisions[revisions.length - 1];
      for (const spool of lastRev.spools.getItems()) {
        for (const joint of spool.joints.getItems()) {
          const workStatuses = joint.workStatuses.getItems();
          if (workStatuses.length === 0) {
            return false;
          }
          const lastStatus = workStatuses[workStatuses.length - 1];
          if (lastStatus.workStatusType.name !== WorkStatusType.FINISHED) {
            return false;
          }
        }
      }
    }
    return true;
  }
}
