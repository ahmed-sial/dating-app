import { Component, computed, inject, input } from '@angular/core';
import { LikesService } from '../../../core/services/likes-service';
import { Member } from '../../../types/member';
import { RouterLink } from '@angular/router';
import { AgePipe } from '../../../pipes/age-pipe';

@Component({
  selector: 'app-member-card',
  imports: [RouterLink, AgePipe],
  templateUrl: './member-card.html',
  styleUrl: './member-card.css',
})
export class MemberCard {
  private _likesService = inject(LikesService)
  member = input.required<Member>()
  protected hasLiked = computed(() => this._likesService.likeIds().includes(this.member().id))

  toggleLike(event: Event) {
    event.stopPropagation()
    this._likesService.toggleLike(this.member().id).subscribe({
      next: _ => {
        if (this.hasLiked()) {
          this._likesService.likeIds.update(ids => ids.filter(x => x !== this.member().id))
        } else {
          this._likesService.likeIds.update(ids => [...ids, this.member().id])
        }
      }
    })
  }
}
